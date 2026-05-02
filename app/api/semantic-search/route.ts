import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
} from '@/lib/darija-dictionary'
import { generateQueryEmbedding } from '@/lib/openrouter-embeddings'

// ═══════════════════════════════════════════════════════════════
// PIPELINE DE RECHERCHE SÉMANTIQUE — 7 ÉTAPES
// ═══════════════════════════════════════════════════════════════
//
//  1. Pré-normalisation  → dictionnaire darija local (0ms, gratuit)
//  2. Normalisation LLM  → traduction darija→français via LLM
//  3. Expansion query    → synonymes + variantes pour enrichir l'embedding
//  4. Embedding          → vecteur OpenRouter sur query enrichie
//  5. Recherche hybride  → vector (pgvector) + ILIKE en parallèle
//  6. Fusion RRF         → Reciprocal Rank Fusion pour scorer et fusionner
//  7. Re-ranking LLM     → classement final par pertinence sémantique réelle
//
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// Cache in-memory simple (reset à chaque cold start)
// Évite de recalculer embedding + expansion pour queries identiques
// ─────────────────────────────────────────────
const queryCache = new Map<string, { embedding: number[]; expanded: string; ts: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCached(key: string) {
  const entry = queryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) { queryCache.delete(key); return null }
  return entry
}

// ─────────────────────────────────────────────
// Model fallback chain
// ─────────────────────────────────────────────
//  💳 Haiku   → premier choix (cheap, excellent en arabe/français)
//  🆓 Llama   → meilleur modèle gratuit si quota Haiku épuisé
//  🆓 Gemma   → fallback multilingue Google
//  🆓 free    → auto-router OpenRouter en dernier recours
const MODEL_CHAIN = [
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openrouter/free',
]
const QUOTA_CODES = new Set([402, 429, 503])

async function openRouterChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 200,
): Promise<{ text: string; modelUsed: string }> {
  let lastError: Error | null = null

  for (const model of MODEL_CHAIN) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          'X-Title': 'Smart Search',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.1,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      })

      if (QUOTA_CODES.has(res.status)) {
        console.warn(`⚠️ [${model}] HTTP ${res.status} → next model`)
        continue
      }
      if (!res.ok) {
        throw new Error(`[${model}] HTTP ${res.status}: ${(await res.text()).slice(0, 100)}`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content?.trim()
      if (!text) throw new Error(`[${model}] Empty response`)

      const modelUsed = data.model ?? model
      console.log(`✅ LLM: ${modelUsed} ${modelUsed.includes(':free') ? '🆓' : '💳'}`)
      return { text, modelUsed }
    } catch (e) {
      lastError = e as Error
      console.warn(`⚠️ [${model}] failed → next`, lastError.message.slice(0, 60))
    }
  }

  throw lastError ?? new Error('All models failed')
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1 — Pré-normalisation dictionnaire (sync, 0ms)
// ═══════════════════════════════════════════════════════════════
function preNormalizeWithDictionary(query: string): string {
  return query
    .split(/\s+/)
    .map((w) => DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase().trim()]?.french ?? w)
    .join(' ')
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2 — Normalisation LLM darija → français
// ═══════════════════════════════════════════════════════════════
async function normalizeDarija(query: string): Promise<{ normalized: string; modelUsed: string }> {
  const darijaWords = extractDarijaWords(query)

  const systemPrompt = `Tu es un expert en darija tunisien et arabe dialectal maghrébin.
Traduis la requête de recherche en français clair et naturel.
Réponds UNIQUEMENT avec la traduction française. Pas d'explication.
Contexte : marketplace tunisienne (commerces, produits, services, villes).`

  const hint = darijaWords.length > 0
    ? `\nMots darija détectés :\n${darijaWords.map(w => `- ${w.original} → ${w.french}`).join('\n')}`
    : ''

  const { text, modelUsed } = await openRouterChat(systemPrompt, `Requête : "${query}"${hint}`, 120)
  return { normalized: text, modelUsed }
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 3 — Expansion de requête (synonymes + variantes)
// Génère des termes alternatifs pour enrichir le signal sémantique
// avant de créer l'embedding → meilleure couverture des résultats
// ═══════════════════════════════════════════════════════════════
async function expandQuery(normalizedQuery: string): Promise<string> {
  const systemPrompt = `Tu es un moteur de recherche intelligent pour Ro2ya, une marketplace tunisienne.
Ta tâche : générer des synonymes, des variantes et des termes connexes d'une requête pour enrichir la recherche vectorielle.
Considère le contexte tunisien (ex: si on cherche "climatiseur", pense à "climatisation", "froid", "réparation clim").
Retourne une seule ligne avec les termes séparés par des virgules (max 10 termes).
Inclure : synonymes français, termes techniques, catégories parentes, variantes.
Ne pas répéter la requête originale. Sois concis. Pas d'explication.`

  const userMessage = `Requête normalisée : "${normalizedQuery}"\nSynonymes et termes enrichis :`

  try {
    const { text } = await openRouterChat(systemPrompt, userMessage, 80)
    // Nettoyer et combiner avec la query originale
    const expanded = `${normalizedQuery}, ${text.replace(/\n/g, ', ')}`
    console.log('🔀 Query expanded:', expanded.slice(0, 120))
    return expanded
  } catch {
    // Si expansion échoue, continuer avec la query originale
    return normalizedQuery
  }
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 4 — Embedding (OpenRouter)
// ═══════════════════════════════════════════════════════════════
async function getEmbedding(text: string): Promise<number[]> {
  const embedding = await generateQueryEmbedding(text)
  console.log('🧠 Embedding:', embedding.length, 'dims')
  return embedding
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 5 — Recherche hybride (vector + ILIKE en parallèle)
// Les deux recherches tournent simultanément pour réduire la latence
// ═══════════════════════════════════════════════════════════════
async function hybridSearch(
  embedding: number[],
  originalQuery: string,
  normalizedQuery: string,
): Promise<{ vectorResults: any[]; ilikeResults: any[] }> {
  const supabase = createClient()

  // Lancer vector + ILIKE en parallèle
  const [vectorRes, itemsIlikeRes, storesIlikeRes, businessIlikeRes, servicesIlikeRes] = await Promise.allSettled([
    // — Vector search via pgvector —
    supabase.rpc('search_global_semantic' as any, {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.25,
      match_count: 50,
    }),

    // — ILIKE search sur Items —
    (async () => {
      const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
      if (keywords.length === 0) return { data: [], error: null }
      const orFilters = keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(',')
      return supabase.from('items').select('*, stores(name, city, rating_average)').eq('status', 'AVAILABLE').or(orFilters).limit(15)
    })(),

    // — ILIKE search sur Stores —
    (async () => {
      const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
      if (keywords.length === 0) return { data: [], error: null }
      const orFilters = keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(',')
      return supabase.from('stores').select('*').eq('status', 'PUBLISHED').or(orFilters).limit(10)
    })(),

    // — ILIKE search sur Business Directory —
    (async () => {
      const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
      if (keywords.length === 0) return { data: [], error: null }
      const orFilters = keywords.map(k => `title.ilike.%${k}%,description.ilike.%${k}%`).join(',')
      return supabase.from('business_directory_tunisia').select('*').or(orFilters).limit(10)
    })(),

    // — ILIKE search sur Service Directory —
    (async () => {
      const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
      if (keywords.length === 0) return { data: [], error: null }
      const orFilters = keywords.map(k => `name.ilike.%${k}%,description.ilike.%${k}%`).join(',')
      return supabase.from('service_directory').select('*').or(orFilters).limit(10)
    })(),
  ])

  const vectorResults = vectorRes.status === 'fulfilled' && !vectorRes.value.error ? (vectorRes.value.data ?? []) : []
  
  // Normaliser les résultats ILIKE pour qu'ils matchent le format vectorResults
  const ilikeResults: any[] = []

  if (itemsIlikeRes.status === 'fulfilled' && itemsIlikeRes.value.data) {
    itemsIlikeRes.value.data.forEach(item => ilikeResults.push({
      ...item,
      result_type: 'ITEM',
      image_url: item.main_image,
      location_city: item.stores?.city,
      category: item.item_type,
      metadata: { price: item.price, store_id: item.store_id, store_name: item.stores?.name }
    }))
  }

  if (storesIlikeRes.status === 'fulfilled' && storesIlikeRes.value.data) {
    storesIlikeRes.value.data.forEach(s => ilikeResults.push({
      ...s,
      result_type: 'STORE',
      image_url: s.logo_url,
      location_city: s.city,
      category: s.category,
      metadata: { rating: s.rating_average, total_reviews: s.total_reviews }
    }))
  }

  if (businessIlikeRes.status === 'fulfilled' && businessIlikeRes.value.data) {
    businessIlikeRes.value.data.forEach(b => ilikeResults.push({
      id: b.id,
      name: b.title,
      description: b.description,
      result_type: 'BUSINESS_DIR',
      image_url: b.photos?.[0],
      location_city: b.city,
      category: b.categoryName,
      metadata: { address: b.full_address, score: b.totalScore, reviews: b.reviewsCount }
    }))
  }

  if (servicesIlikeRes.status === 'fulfilled' && servicesIlikeRes.value.data) {
    servicesIlikeRes.value.data.forEach(sd => ilikeResults.push({
      id: sd.service_id,
      name: sd.name,
      description: sd.description,
      result_type: 'SERVICE_DIR',
      image_url: null,
      location_city: sd.city,
      category: sd.category,
      metadata: { address: sd.address, rating: sd.rating_average }
    }))
  }

  console.log(`✅ Vector: ${vectorResults.length} | ILIKE Combined: ${ilikeResults.length}`)
  return { vectorResults, ilikeResults }
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 6 — Fusion RRF (Reciprocal Rank Fusion)
// Algorithme standard pour fusionner des rankings de sources différentes
// Score RRF = Σ 1/(k + rank_i) pour chaque source
// k=60 est la constante recommandée par la littérature (Cormack 2009)
// ═══════════════════════════════════════════════════════════════
function reciprocalRankFusion(
  vectorResults: any[],
  ilikeResults: any[],
  k = 60,
): any[] {
  const scores = new Map<string, { score: number; item: any; sources: string[] }>()

  const addRanking = (results: any[], source: string, weight = 1.0) => {
    results.forEach((item, rank) => {
      const id = item.id ?? item.item_id ?? `${source}_${rank}`
      const rrfScore = weight * (1 / (k + rank + 1))
      const existing = scores.get(id)
      if (existing) {
        existing.score += rrfScore
        existing.sources.push(source)
      } else {
        scores.set(id, { score: rrfScore, item, sources: [source] })
      }
    })
  }

  // Poids légèrement supérieur au vecteur (plus sémantique)
  addRanking(vectorResults, 'vector', 1.2)
  addRanking(ilikeResults, 'ilike', 1.0)

  const fused = Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ item, score, sources }) => ({
      ...item,
      _rrf_score: Math.round(score * 10000) / 10000,
      _sources: sources,
    }))

  console.log(`🔀 RRF fusion: ${fused.length} unique results (deduped from ${vectorResults.length + ilikeResults.length})`)
  return fused
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 7 — Re-ranking LLM
// Le LLM évalue la pertinence réelle de chaque résultat vs la query
// et retourne un ordre optimal. Appliqué sur le top-N pour limiter tokens.
// ═══════════════════════════════════════════════════════════════
async function rerankWithLLM(
  query: string,
  results: any[],
  topN = 20,
): Promise<any[]> {
  if (results.length === 0) return results

  // Re-ranker seulement le top N (les autres gardent leur ordre RRF)
  const toRerank = results.slice(0, topN)
  const rest = results.slice(topN)

  // Construire la liste pour le LLM (id + nom + description courte)
  const itemsList = toRerank.map((item, i) =>
    `${i}: [${item.id}] ${item.name}${item.description ? ' — ' + String(item.description).slice(0, 80) : ''}`
  ).join('\n')

  const systemPrompt = `Tu es un moteur de re-ranking pour une marketplace tunisienne.
On te donne une requête utilisateur et une liste de produits/services numérotés.
Retourne UNIQUEMENT les numéros des items dans l'ordre de pertinence décroissante.
Format : une ligne, numéros séparés par virgules. Ex: "3,0,7,1,5,2,4,6"
Exclure les items non pertinents. Pas d'explication.`

  const userMessage = `Requête : "${query}"\n\nItems :\n${itemsList}\n\nOrdre de pertinence :`

  try {
    const { text } = await openRouterChat(systemPrompt, userMessage, 100)

    // Parser l'ordre retourné par le LLM
    const order = text
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 0 && n < toRerank.length)

    // Reconstruire dans l'ordre LLM + items non mentionnés à la fin
    const seen = new Set(order)
    const unranked = toRerank
      .map((_, i) => i)
      .filter(i => !seen.has(i))

    const reranked = [...order, ...unranked].map(i => ({
      ...toRerank[i],
      _reranked: true,
    }))

    console.log(`🎯 Re-ranked: ${reranked.length} items (order: ${order.slice(0, 8).join(',')})`)
    return [...reranked, ...rest]
  } catch (e) {
    console.warn('⚠️ Re-ranking failed, keeping RRF order:', (e as Error).message?.slice(0, 60))
    return results
  }
}

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const { query, skipRerank = false } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const t0 = Date.now()
    console.log('\n══════════════════════════════════')
    console.log('🔍 Query:', query)

    // ── ÉTAPE 1 : Pré-normalisation dictionnaire ────────────────────────
    const preNormalized = preNormalizeWithDictionary(query)
    console.log('📖 Pre-normalized:', preNormalized)

    // ── ÉTAPE 2 : Normalisation LLM darija → français ───────────────────
    let normalized = preNormalized
    let llmModelUsed = 'dictionary_only'
    try {
      const res = await normalizeDarija(preNormalized)
      normalized = res.normalized
      llmModelUsed = res.modelUsed
      console.log('🇹🇳 Normalized:', normalized)
    } catch (e) {
      console.warn('⚠️ Normalization skipped:', (e as Error).message?.slice(0, 60))
    }

    // ── ÉTAPE 3 : Expansion de requête ──────────────────────────────────
    // Check cache d'abord
    const cacheKey = normalized.toLowerCase().trim()
    const cached = getCached(cacheKey)

    let expandedQuery: string
    let embedding: number[]

    if (cached) {
      console.log('⚡ Cache hit!')
      expandedQuery = cached.expanded
      embedding = cached.embedding
    } else {
      expandedQuery = await expandQuery(normalized)

      // ── ÉTAPE 4 : Embedding sur la query enrichie ─────────────────────
      embedding = await getEmbedding(expandedQuery)

      // Mettre en cache
      queryCache.set(cacheKey, { embedding, expanded: expandedQuery, ts: Date.now() })
    }

    // ── ÉTAPE 5 : Recherche hybride (vector + ILIKE en parallèle) ────────
    const { vectorResults, ilikeResults } = await hybridSearch(embedding, query, normalized)

    // ── ÉTAPE 6 : Fusion RRF ─────────────────────────────────────────────
    const fused = reciprocalRankFusion(vectorResults, ilikeResults)

    // ── ÉTAPE 7 : Re-ranking LLM (optionnel, skip si query trop simple) ──
    let finalResults = fused
    let reranked = false

    const shouldRerank = !skipRerank && fused.length > 0 && normalized.split(' ').length >= 2
    if (shouldRerank) {
      finalResults = await rerankWithLLM(normalized, fused, 20)
      reranked = true
    }

    const latency = Date.now() - t0
    console.log(`✅ Done in ${latency}ms — ${finalResults.length} results`)
    console.log('══════════════════════════════════\n')

    return NextResponse.json({
      results: finalResults,
      processing: {
        original: query,
        preNormalized,
        normalized,
        expandedQuery,
        llmModelUsed,
        searchMethod: vectorResults.length > 0
          ? ilikeResults.length > 0 ? 'hybrid_rrf' : 'vector_only'
          : ilikeResults.length > 0 ? 'ilike_only' : 'no_results',
        reranked,
        counts: {
          vector: vectorResults.length,
          ilike: ilikeResults.length,
          fused: fused.length,
          final: finalResults.length,
        },
        latencyMs: latency,
        darijaWordsFound: extractDarijaWords(query),
      },
    })
  } catch (error) {
    console.error('[Smart Search Error]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
