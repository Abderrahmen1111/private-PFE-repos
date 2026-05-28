/**
 * ÉTAPE 5 — RERANKER
 * Fusion RRF (Reciprocal Rank Fusion) + LLM reranking léger
 *
 * Pipeline interne :
 *   vectorResults + textResults + linkedReels
 *       ↓ RRF (score pondéré par rang)
 *   fused[]
 *       ↓ LLM reranking (skip en mode suggestion)
 *   reranked[]
 *       ↓ Final sort (natifs > annuaires, distance, rating)
 *   SearchResult[]
 */

import { SearchResult } from './vector-search'

export interface RerankerOptions {
  query:        string
  intent?:      string
  isSuggestion: boolean
}

// ─── Reciprocal Rank Fusion ───────────────────────────────────────────────────

const NATIVE_TYPES = new Set(['STORE', 'ITEM', 'REEL'])

export function reciprocalRankFusion(
  vectorResults: SearchResult[],
  textResults:   SearchResult[],
  linkedReels:   SearchResult[],
  k = 60,
): SearchResult[] {
  const scores = new Map<string, { score: number; item: SearchResult }>()

  const add = (list: SearchResult[], weight: number) => {
    list.forEach((item, r) => {
      const id  = item.id != null ? String(item.id) : (item.name ?? '').slice(0, 20)
      const key = `${item.result_type ?? 'UNK'}::${id}`
      const s   = weight / (k + r + 1)
      const existing = scores.get(key)
      if (existing) existing.score += s
      else scores.set(key, { score: s, item })
    })
  }

  add(vectorResults, 1.5)  // vecteur = poids max
  add(textResults,   1.0)
  add(linkedReels,   1.3)  // reels liés = très pertinents

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map(x => x.item)
}

// ─── LLM Reranking léger ─────────────────────────────────────────────────────

function getModelChain(): string[] {
  const list = [
    process.env.OPENROUTER_MODEL,
    'meta-llama/llama-3.2-3b-instruct',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.3-70b-instruct:free',
  ].filter(Boolean) as string[]
  return [...new Set(list)]
}

async function llmRerank(query: string, results: SearchResult[], intent: string, topN = 15): Promise<SearchResult[]> {
  if (results.length < 4) return results

  const toRerank = results.slice(0, topN)
  const list = toRerank
    .map((it, i) => `${i}:${it.name ?? it.title ?? '?'}(${it.result_type}) — ${(it.description ?? '').slice(0, 60)}`)
    .join('\n')

  const systemPrompt = `Expert marketplace tunisienne. Trie ces résultats pour "${query}" (intent:${intent}).
  Priorités: 1)Correspondance exacte 2)STORE/ITEM/REEL natifs avant annuaires 3)Rejette hors-sujet.
  Réponds UNIQUEMENT avec les indices en ordre décroissant de pertinence, séparés par virgule. Ex: 2,0,5,1`

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return results

  let lastErr: Error | null = null
  for (const model of getModelChain()) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          'X-Title':      'Ro2ya Reranker',
        },
        body: JSON.stringify({ model, max_tokens: 120, temperature: 0.1, messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: list },
        ]}),
      })
      if (!res.ok) {
        const errMsg = await res.text()
        console.warn(`[RERANKER] Model ${model} failed: HTTP ${res.status} - ${errMsg.slice(0, 150)}`)
        throw new Error(`HTTP ${res.status}`)
      }
      const data  = await res.json()
      const text  = data.choices?.[0]?.message?.content?.trim()
      if (!text) throw new Error('Empty')

      const order = text.split(',').map((x: string) => parseInt(x.trim(), 10))
        .filter((x: number) => !isNaN(x) && x >= 0 && x < topN)
      if (order.length < 2) return results

      const reranked  = order.map((i: number) => toRerank[i]).filter(Boolean)
      const seenIdx   = new Set(order)
      const remaining = toRerank.filter((_: any, i: number) => !seenIdx.has(i))
      return [...reranked, ...remaining, ...results.slice(topN)]
    } catch (e) { lastErr = e as Error }
  }
  console.warn('[RERANKER] LLM reranking échoué, ordre RRF conservé:', lastErr?.message)
  return results
}

// ─── Tri final ────────────────────────────────────────────────────────────────

function finalSort(items: SearchResult[], isSuggestion: boolean): SearchResult[] {
  return [...items].sort((a, b) => {
    if (isSuggestion) {
      const ORDER: Record<string, number> = { STORE: 1, REEL: 2, ITEM: 3, SERVICE_DIR: 4, BUSINESS_DIR: 5 }
      const diff = (ORDER[a.result_type] ?? 6) - (ORDER[b.result_type] ?? 6)
      if (diff !== 0) return diff
    } else {
      const aN = NATIVE_TYPES.has(a.result_type)
      const bN = NATIVE_TYPES.has(b.result_type)
      if (aN !== bN) return aN ? -1 : 1
    }
    if (a.distance != null && b.distance != null && Math.abs(a.distance - b.distance) > 5) {
      return a.distance - b.distance
    }
    const aR = Number(a.rating_average ?? a.metadata?.rating ?? a.totalScore ?? 0)
    const bR = Number(b.rating_average ?? b.metadata?.rating ?? b.totalScore ?? 0)
    return bR - aR
  })
}

// ─── Export principal ─────────────────────────────────────────────────────────

const RERANK_TIMEOUT_MS = 2000

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>(r => setTimeout(() => r(fallback), ms))])
}

export async function rerank(
  vectorResults: SearchResult[],
  textResults:   SearchResult[],
  linkedReels:   SearchResult[],
  options:       RerankerOptions,
): Promise<SearchResult[]> {
  const { query, intent = 'other', isSuggestion } = options
  const t0 = Date.now()

  // RRF fusion
  const fused = reciprocalRankFusion(vectorResults, textResults, linkedReels)

  // LLM reranking (skip en mode suggestion ou si peu de résultats)
  const reranked = (!isSuggestion && fused.length > 4)
    ? await withTimeout(llmRerank(query, fused, intent), RERANK_TIMEOUT_MS, fused)
    : fused

  const output = finalSort(reranked, isSuggestion)

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🏆 [RERANKER] ${output.length} résultats finaux en ${Date.now() - t0}ms`)
    output.slice(0, 5).forEach((r, i) =>
      console.log(`   [${i}] ${r.result_type}: "${r.name}" — ${r.location_city ?? 'N/A'}`)
    )
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  return output
}
