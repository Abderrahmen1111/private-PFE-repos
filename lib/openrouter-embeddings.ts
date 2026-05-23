/**
 * Embedding Client avec fallback automatique
 * Ordre de priorité :
 *   1. OpenRouter      → baai/bge-m3           (1024 dims, multilingue)
 *   2. Cloudflare AI   → @cf/baai/bge-m3        (1024 dims, même modèle !)
 *   3. OpenRouter      → text-embedding-3-small  (1536 dims → tronqué à 1024)
 *
 * Note: La DB Supabase attend vector(1024) — tous les providers retournent ≥1024.
 * Note: Gemini quota épuisé → retiré de la chaîne.
 * Note: Groq ne supporte pas les embeddings → non utilisé.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const OPENROUTER_EMBED_URL  = 'https://openrouter.ai/api/v1/embeddings'
const CF_EMBED_URL_TEMPLATE = (accountId: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/baai/bge-m3`

const OPENROUTER_PRIMARY_MODEL  = 'baai/bge-m3'
const OPENROUTER_FALLBACK_MODEL = 'text-embedding-3-small'

const TARGET_DIMS = 1024  // Supabase vector(1024)

// Simple in-memory cache
const embeddingCache = new Map<string, number[]>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tronque ou pad un vecteur pour correspondre exactement aux TARGET_DIMS */
function normalizeDims(embedding: number[]): number[] {
  if (embedding.length === TARGET_DIMS) return embedding
  if (embedding.length > TARGET_DIMS) {
    console.warn(`⚠️  [EMBEDDING] Tronqué ${embedding.length} → ${TARGET_DIMS} dims`)
    return embedding.slice(0, TARGET_DIMS)
  }
  // Cas padding (ne devrait pas arriver avec bge-m3)
  const padded = new Array(TARGET_DIMS).fill(0)
  embedding.forEach((v, i) => { padded[i] = v })
  return padded
}

// ─── Fournisseur 1 : OpenRouter ───────────────────────────────────────────────

async function tryOpenRouter(text: string, model: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const t0 = Date.now()
  const response = await fetch(OPENROUTER_EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer':  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title':       'Ro2ya Semantic Search',
    },
    body: JSON.stringify({ model, input: text }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter [${model}] HTTP ${response.status}: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  const raw: number[] = data.data?.[0]?.embedding

  if (!raw || raw.length === 0) {
    throw new Error(`OpenRouter [${model}] a retourné un embedding vide`)
  }

  const embedding = normalizeDims(raw)
  console.log(`✅ [EMBEDDING] OpenRouter (${model}) → ${raw.length} dims (→ ${embedding.length}) en ${Date.now() - t0}ms`)
  return embedding
}

// ─── Fournisseur 2 : Cloudflare Workers AI ────────────────────────────────────

async function tryCloudflare(text: string): Promise<number[]> {
  const apiKey    = process.env.CLOUDFLARE_AI_KEY
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiKey || !accountId) throw new Error('CLOUDFLARE_AI_KEY ou CLOUDFLARE_ACCOUNT_ID non défini')

  const t0 = Date.now()
  const response = await fetch(CF_EMBED_URL_TEMPLATE(accountId), {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Cloudflare AI HTTP ${response.status}: ${err.slice(0, 200)}`)
  }

  const data = await response.json()

  // Cloudflare retourne soit data.result.data[0] soit data.result (vecteur direct)
  const raw: number[] =
    data?.result?.data?.[0] ??
    data?.result?.data ??
    data?.result ??
    null

  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    throw new Error(`Cloudflare AI a retourné un embedding vide. Réponse: ${JSON.stringify(data).slice(0, 300)}`)
  }

  const embedding = normalizeDims(Array.isArray(raw) ? raw : Object.values(raw))
  console.log(`✅ [EMBEDDING] Cloudflare AI (@cf/baai/bge-m3) → ${embedding.length} dims en ${Date.now() - t0}ms`)
  return embedding
}

// ─── Fonction principale avec fallback chain ──────────────────────────────────

/**
 * Génère un embedding avec fallback automatique :
 *   1. OpenRouter (baai/bge-m3)
 *   2. Cloudflare AI (@cf/baai/bge-m3)
 *   3. OpenRouter (text-embedding-3-small, tronqué à 1024)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const key = text.trim().toLowerCase()

  const cached = embeddingCache.get(key)
  if (cached) {
    console.log(`⚡ [EMBEDDING] Cache hit → ${cached.length} dims`)
    return cached
  }

  const errors: string[] = []

  // ── Tentative 1 : OpenRouter bge-m3 ─────────────────────────────────────
  try {
    const embedding = await tryOpenRouter(text, OPENROUTER_PRIMARY_MODEL)
    embeddingCache.set(key, embedding)
    return embedding
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    errors.push(`[1] OpenRouter/${OPENROUTER_PRIMARY_MODEL}: ${msg}`)
    console.warn(`⚠️  [EMBEDDING] OpenRouter (${OPENROUTER_PRIMARY_MODEL}) échoué → ${msg}`)
  }

  // ── Tentative 2 : Cloudflare Workers AI ─────────────────────────────────
  try {
    const embedding = await tryCloudflare(text)
    embeddingCache.set(key, embedding)
    return embedding
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    errors.push(`[2] Cloudflare/@cf/baai/bge-m3: ${msg}`)
    console.warn(`⚠️  [EMBEDDING] Cloudflare AI échoué → ${msg}`)
  }

  // ── Tentative 3 : OpenRouter text-embedding-3-small (tronqué à 1024) ────
  try {
    const embedding = await tryOpenRouter(text, OPENROUTER_FALLBACK_MODEL)
    embeddingCache.set(key, embedding)
    return embedding
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    errors.push(`[3] OpenRouter/${OPENROUTER_FALLBACK_MODEL}: ${msg}`)
    console.warn(`⚠️  [EMBEDDING] Fallback OpenRouter (${OPENROUTER_FALLBACK_MODEL}) échoué → ${msg}`)
  }

  // ── Tous échoués ──────────────────────────────────────────────────────────
  console.error('❌ [EMBEDDING] Tous les fournisseurs ont échoué !')
  errors.forEach(e => console.error(`   ${e}`))
  throw new Error(`All embedding providers failed:\n${errors.join('\n')}`)
}

/**
 * Alias utilisé par le pipeline de recherche
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query)
}

/**
 * Batch embeddings — OpenRouter batch → fallback séquentiel
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (apiKey) {
    const t0 = Date.now()
    try {
      const response = await fetch(OPENROUTER_EMBED_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer':  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title':       'Ro2ya Semantic Search',
        },
        body: JSON.stringify({ model: OPENROUTER_PRIMARY_MODEL, input: texts }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const embeddings = data.data.map((d: any) => normalizeDims(d.embedding))
      console.log(`✅ [EMBEDDING BATCH] OpenRouter → ${texts.length} textes en ${Date.now() - t0}ms`)
      return embeddings
    } catch (e: any) {
      console.warn(`⚠️  [EMBEDDING BATCH] OpenRouter échoué → fallback séquentiel`)
    }
  }

  // Fallback : un par un via la chaîne complète
  return Promise.all(texts.map(t => generateEmbedding(t)))
}

export const EMBEDDING_DIMENSIONS = TARGET_DIMS
