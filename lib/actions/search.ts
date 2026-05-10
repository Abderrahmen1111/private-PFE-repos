'use server'

// ═══════════════════════════════════════════════════════════════
// PIPELINE DE RECHERCHE SÉMANTIQUE GLOBALE — VERSION HAUTE PERF
// Support natif Darija tunisien + arabe + français + code-switch
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'
import {
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
  translateDarijaForSearch,
} from '@/lib/darija-dictionary'
import { logUserSearch } from './user-activity'
import { generateQueryEmbedding } from '@/lib/openrouter-embeddings'
import { Item } from './items'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchResultItem extends Item {
  stores?: {
    id: number
    name: string
    logo_url?: string
    status?: string
    category?: string
    [key: string]: any
  }
  is_nearby?: boolean
  distance?: number
  [key: string]: any
}

interface CacheEntry {
  ts: number
  data: any
}

interface LLMAnalysis {
  normalized: string
  expanded: string
  intent: string
  category: string
}

interface DarijaExpansion {
  translated: string
  expanded: string
  variants: string[]
  detectedCategories: string[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS   = 1000 * 60 * 10        // 10 min — fresh enough for marketplace
const MAX_CACHE_SIZE = 500                    // LRU eviction threshold
const queryCache     = new Map<string, CacheEntry>()

// Model chain ordered by quality/availability — nous gardons open models en tête
const MODEL_CHAIN = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'openrouter/auto',
]
const QUOTA_CODES = new Set([402, 429, 503])

// Timeouts serrés pour ne pas bloquer la réponse utilisateur
const LLM_TIMEOUT_MS      = 3500
const EMBED_TIMEOUT_MS    = 2500
const GEOCODE_TIMEOUT_MS  = 1500
const RERANK_TIMEOUT_MS   = 2000

// ─── Utilitaire de timeout ────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ])
}

// ─── LRU cache minimal ────────────────────────────────────────────────────────

function cacheSet(key: string, data: any) {
  if (queryCache.size >= MAX_CACHE_SIZE) {
    // Evict the oldest entry
    const oldest = queryCache.keys().next().value
    if (oldest) queryCache.delete(oldest)
  }
  queryCache.set(key, { ts: Date.now(), data })
}

function cacheGet(key: string): any | null {
  const entry = queryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    queryCache.delete(key)
    return null
  }
  // Move to end (LRU)
  queryCache.delete(key)
  queryCache.set(key, entry)
  return entry.data
}

// ─── Détection de script ──────────────────────────────────────────────────────

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F]/
const LATIN_REGEX  = /[a-zA-Z]/
const DIGIT_REGEX  = /\d/

function detectQueryScript(
  query: string,
): 'arabic' | 'latin_darija' | 'french' | 'mixed' | 'numeric' {
  const trimmed = query.trim()
  if (!trimmed) return 'french'

  const hasArabic = ARABIC_REGEX.test(trimmed)
  const hasLatin  = LATIN_REGEX.test(trimmed)
  const hasDigit  = DIGIT_REGEX.test(trimmed)

  if (hasDigit && !hasLatin && !hasArabic) return 'numeric'
  if (hasArabic && hasLatin) return 'mixed'
  if (hasArabic) return 'arabic'

  // Check Darija coverage in Latin script
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean)
  const darijaCount = words.filter(w => DARIJA_TUNISIAN_DICTIONARY[w]).length
  if (words.length > 0 && darijaCount / words.length > 0.25) return 'latin_darija'
  return 'french'
}

// ─── Expansion Darija multi-couche ────────────────────────────────────────────

// Map catégorie → mots-clés sémantiques (améliore le recall)
const CATEGORY_SEMANTIC_MAP: Record<string, string[]> = {
  verb:        ['action', 'service', 'prestation'],
  auto:        ['voiture', 'mécanique', 'garage', 'pneu', 'huile', 'révision', 'carrosserie'],
  nourriture:  ['restaurant', 'traiteur', 'plat', 'cuisine', 'repas', 'livraison', 'menu'],
  commerce:    ['magasin', 'boutique', 'vente', 'achat', 'marché', 'shop'],
  beaute:      ['coiffure', 'salon', 'soin', 'esthétique', 'manucure', 'hammam'],
  santé:       ['médecin', 'clinique', 'pharmacie', 'docteur', 'soins'],
  mode:        ['vêtements', 'habits', 'prêt-à-porter', 'confection', 'tissu'],
  lieux:       ['quartier', 'adresse', 'local', 'espace', 'lieu'],
  transports:  ['taxi', 'livraison', 'transport', 'chauffeur', 'déménagement'],
  artisanat:   ['fait main', 'traditionnel', 'artisan', 'poterie', 'tissu'],
  gastronomie: ['cuisine tunisienne', 'spécialité', 'plat traditionnel'],
  product:     ['produit', 'article', 'vente', 'achat'],
  business:    ['entreprise', 'boutique', 'service', 'professionnel'],
  services:    ['prestataire', 'artisan', 'technicien', 'réparation'],
  médical:     ['santé', 'médecin', 'clinique', 'pharmacie', 'soins'],
  éducation:   ['cours', 'formation', 'école', 'enseignement', 'soutien'],
  finance:     ['banque', 'assurance', 'crédit', 'prêt'],
  sport:       ['fitness', 'salle', 'coach', 'musculation', 'yoga'],
}

function expandDarijaQuery(query: string): DarijaExpansion {
  const words = query.trim().split(/\s+/).filter(Boolean)
  const translatedWords: string[]      = []
  const detectedCategories = new Set<string>()
  const semanticExpansions: string[]   = []

  for (const word of words) {
    const normalized = word.toLowerCase().trim()
    const entry = DARIJA_TUNISIAN_DICTIONARY[normalized]
    if (entry) {
      translatedWords.push(entry.french)
      detectedCategories.add(entry.category)
      const catExpansions = CATEGORY_SEMANTIC_MAP[entry.category]
      if (catExpansions) semanticExpansions.push(...catExpansions)
    } else {
      translatedWords.push(word)
    }
  }

  const translated      = translatedWords.join(' ').trim() || query
  const uniqueExp       = [...new Set(semanticExpansions)].slice(0, 8)
  const expanded        = [translated, ...uniqueExp].join(', ')

  // Deduplicated variants for multi-embedding support
  const variants = [...new Set([translated, query, expanded])].filter(Boolean)

  return {
    translated,
    expanded,
    variants,
    detectedCategories: [...detectedCategories],
  }
}

// ─── OpenRouter avec fallback modèles ─────────────────────────────────────────

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
          'X-Title': 'Ro2ya Smart Search',
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
      if (QUOTA_CODES.has(res.status)) continue
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content?.trim()
      if (!text) throw new Error('Empty response')
      return { text, modelUsed: data.model ?? model }
    } catch (e) {
      lastError = e as Error
    }
  }
  throw lastError ?? new Error('All models failed')
}

// ─── Analyse LLM Darija ───────────────────────────────────────────────────────

async function analyzeQueryWithLLM(
  query: string,
  hint: string,
  script: string,
): Promise<LLMAnalysis> {
  const systemPrompt = `Tu es un expert en Darija TUNISIEN et commerce local tunisien.
Analyse cette requête pour la marketplace Ro2ya (Tunisie).

RÈGLES:
1. Darija tunisien: traduis précisément (ex: "krhba"→"voiture", "nekel"→"manger", "nechri"→"acheter")
2. Code-switch arabic+français+darija: comprends le mix naturel
3. Requête en arabe: traduis en français
4. Ne JAMAIS halluciner — si incertain, garde le mot tel quel
5. Contexte hint: ${hint || 'marketplace locale Tunisie'}
6. Script détecté: ${script}

Retourne UNIQUEMENT ce JSON valide (sans markdown, sans commentaires):
{"normalized":"traduction courte (3-6 mots max)","expanded":"normalized + 8 mots-clés marchands séparés virgules","intent":"product|service|restaurant|beauty|auto|health|fashion|repair|other","category":"catégorie principale en français"}`

  const fallback: LLMAnalysis = { normalized: query, expanded: query, intent: 'other', category: '' }
  try {
    const { text } = await openRouterChat(systemPrompt, `Requête: "${query}"`, 256)
    const clean = text.replace(/```json|```/g, '').trim()
    // Find the first { ... } block robustly
    const match = clean.match(/\{[\s\S]*?\}/)
    if (!match) return fallback
    const json = JSON.parse(match[0])
    return {
      normalized: typeof json.normalized === 'string' && json.normalized ? json.normalized : query,
      expanded:   typeof json.expanded   === 'string' && json.expanded   ? json.expanded   : query,
      intent:     typeof json.intent     === 'string' && json.intent     ? json.intent     : 'other',
      category:   typeof json.category   === 'string'                    ? json.category   : '',
    }
  } catch {
    return fallback
  }
}

// ─── Recherche texte hybride (ilike multi-table) ──────────────────────────────

/**
 * Extrait une ville depuis une chaîne de localisation.
 * Gère les cas: "Tunis, Tunisie", "près de moi", Arabic strings.
 */
function extractCity(location?: string): string {
  if (!location || location.trim().length < 2) return ''
  const loc = location.trim()

  // Expressions signifiant "près de moi" — pas de filtre ville
  const PROXIMITY_PATTERNS = /\b(près|pres|7awli|moi|me|my|nearby|hna|houni)\b/i
  if (PROXIMITY_PATTERNS.test(loc)) return ''

  // Prend la première partie avant virgule, parenthèse ou tiret
  const city = loc.split(/[,\-(]/)[0].trim()
  // Minimum 2 chars, max 40 chars pour éviter les faux filtres
  return city.length >= 2 && city.length <= 40 ? city : ''
}

/**
 * Construit un filtre OR Supabase pour plusieurs champs et plusieurs mots-clés.
 * Limit: Supabase accepte ~20 clauses OR par requête.
 */
function buildOrFilter(fields: string[], keywords: string[]): string {
  return keywords
    .slice(0, 5) // max 5 keywords × N fields
    .flatMap(k => fields.map(f => `${f}.ilike.%${k}%`))
    .join(',')
}

async function hybridSearchText(
  originalQuery: string,
  normalizedQuery: string,
  location?: string,
  category?: string,
): Promise<any[]> {
  const supabase  = createClient()
  const cityFilter = extractCity(location)

  // Merge original Darija words (translated) + normalized terms, deduplicated
  const rawKeywords = [
    ...normalizedQuery.toLowerCase().split(/\s+/),
    ...originalQuery.toLowerCase().split(/\s+/).map(
      w => DARIJA_TUNISIAN_DICTIONARY[w]?.french ?? w,
    ),
  ]
  const keywords = [...new Set(rawKeywords)]
    .map(w => w.trim())
    .filter(w => w.length > 2)
    .slice(0, 6) // keep tight — too many keywords = broad noise

  if (keywords.length === 0) return []

  // ── Parallel table queries ────────────────────────────────────────────────

  const itemFilter   = buildOrFilter(['name', 'description'], keywords)
  const storeFilter  = buildOrFilter(['name', 'description', 'address'], keywords)
  const bizFilter    = buildOrFilter(['title', 'description', 'categoryName'], keywords)
  const svcFilter    = buildOrFilter(['name', 'description', 'category'], keywords)
  const reelFilter   = buildOrFilter(['title', 'subtitle', 'category'], keywords)

  const [itemsRes, storesRes, businessRes, servicesRes, reelsRes] = await Promise.all([
    // Items (produits)
    (async () => {
      let q = supabase
        .from('items')
        .select('*, stores!inner(*)')
        .eq('status', 'AVAILABLE')
        .or(itemFilter)
      if (cityFilter) q = q.ilike('stores.city', `%${cityFilter}%`)
      if (category)   q = q.ilike('item_type', `%${category}%`)
      return q.limit(20)
    })(),

    // Stores natifs
    (async () => {
      let q = supabase
        .from('stores')
        .select('*')
        .in('status', ['APPROVED', 'PUBLISHED'])
        .or(storeFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      if (category)   q = q.ilike('category', `%${category}%`)
      return q.limit(20)
    })(),

    // Annuaire business
    (async () => {
      let q = supabase
        .from('business_directory_tunisia')
        .select('*')
        .or(bizFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(20)
    })(),

    // Annuaire services
    (async () => {
      let q = supabase
        .from('service_directory')
        .select('*')
        .eq('status', 'ACTIVE')
        .or(svcFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(20)
    })(),

    // Reels
    (async () => {
      let q = supabase
        .from('reels')
        .select('*, stores!inner(*), reel_stats(*)')
        .eq('status', 'active')
        .or(reelFilter)
      if (cityFilter) q = q.ilike('stores.city', `%${cityFilter}%`)
      return q.limit(20)
    })(),
  ])

  // ── Normalize into unified shape ──────────────────────────────────────────

  const results: any[] = []

  const push = (res: { data: any[] | null; error: any }, type: string, mapFn: (i: any) => any) => {
    if (res.data) {
      for (const i of res.data) {
        results.push({ ...mapFn(i), result_type: type })
      }
    }
  }

  push(itemsRes, 'ITEM', i => ({
    ...i,
    image_url:     i.main_image,
    location_city: i.stores?.city,
    category:      i.item_type,
    metadata:      { price: i.price, store_name: i.stores?.name },
  }))

  push(storesRes, 'STORE', i => ({
    ...i,
    image_url:     i.logo_url,
    location_city: i.city,
    metadata:      { rating: i.rating_average },
  }))

  push(businessRes, 'BUSINESS_DIR', i => ({
    ...i,
    id:            i.id,
    name:          i.title,
    image_url:     Array.isArray(i.photos) ? i.photos[0] : undefined,
    location_city: i.city,
    metadata:      { address: i.full_address },
  }))

  push(servicesRes, 'SERVICE_DIR', i => ({
    ...i,
    id:       i.service_id,
    image_url: null,
    location_city: i.city,
    metadata: { address: i.address },
  }))

  push(reelsRes, 'REEL', i => ({
    ...i,
    id:            i.id,
    name:          i.title,
    image_url:     i.media_path,
    location_city: i.stores?.city,
    category:      i.category,
    metadata:      {
      price:      i.price,
      store_name: i.stores?.name,
      media_type: i.media_type,
      cta_type:   i.cta_type,
      views:      i.reel_stats?.[0]?.views_count ?? 0,
      likes:      i.reel_stats?.[0]?.likes_count ?? 0,
    },
  }))

  return results
}

// ─── Recherche vectorielle ────────────────────────────────────────────────────

async function hybridSearchVector(
  embedding: number[],
  targetLat?: number,
  targetLng?: number,
): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('search_global_semantic' as any, {
    query_embedding: `[${embedding.join(',')}]`,
    match_threshold: 0.18,  // légèrement relevé — réduit le bruit
    match_count: 50,
  })

  if (error) {
    console.error('[Vector Search Error]', error.message)
    return []
  }

  const results: any[] = data ?? []

  // Geo-filter: keep items within ~120 km bounding box when coords known
  if (targetLat && targetLng) {
    const delta = 1.1 // ~120 km
    return results.filter((item: any) => {
      const lat = Number(item.latitude ?? item.stores?.latitude ?? item.metadata?.latitude ?? 0)
      const lon = Number(item.longitude ?? item.stores?.longitude ?? item.metadata?.longitude ?? 0)
      if (!lat || !lon) return true // keep if no coords
      return Math.abs(lat - targetLat) <= delta && Math.abs(lon - targetLng) <= delta
    })
  }

  return results
}

// ─── Reels liés aux items matchés ─────────────────────────────────────────────

async function fetchLinkedReels(vectorResults: any[]): Promise<any[]> {
  const itemIds = [
    ...new Set(
      vectorResults.filter(r => r.result_type === 'ITEM').map(r => r.id).filter(Boolean),
    ),
  ].slice(0, 8)

  if (itemIds.length === 0) return []

  const supabase = createClient()
  const { data: reels } = await supabase
    .from('reels')
    .select('*, stores(*), reel_stats(*)')
    .in('item_id', itemIds)
    .limit(8)

  if (!reels) return []

  return reels.map((reel: any) => ({
    ...reel,
    result_type:   'REEL',
    name:          reel.title,
    image_url:     reel.media_path,
    location_city: reel.stores?.city,
    metadata:      {
      store_name:     reel.stores?.name,
      linked_to_item: true,
      views:          reel.reel_stats?.[0]?.views_count ?? 0,
      likes:          reel.reel_stats?.[0]?.likes_count ?? 0,
    },
  }))
}

// ─── Fusion Reciprocal Rank (RRF) ─────────────────────────────────────────────

/**
 * Fusionne les listes vectorielle + texte via RRF.
 * La clé de déduplication est: `result_type:id` pour éviter les doublons cross-table.
 */
function reciprocalRankFusion(
  vectorResults: any[],
  textResults: any[],
  linkedReels: any[],
  k = 60,
): any[] {
  const scores = new Map<string, { score: number; item: any }>()

  const add = (list: any[], weight: number) => {
    list.forEach((item, r) => {
      // Stable dedup key: prefers id+type, falls back to hash of name
      const id  = item.id != null ? String(item.id) : (item.name ?? '').slice(0, 20)
      const key = `${item.result_type ?? 'UNK'}::${id}`
      const s   = weight / (k + r + 1)
      const existing = scores.get(key)
      if (existing) {
        existing.score += s
      } else {
        scores.set(key, { score: s, item })
      }
    })
  }

  // Weights: vector (semantic) gets most weight, linked reels are boosted
  add(vectorResults, 1.5)
  add(textResults,   1.0)
  add(linkedReels,   1.3)  // linked reels are highly relevant

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map(x => x.item)
}

// ─── Reranking LLM léger ──────────────────────────────────────────────────────

async function rerankWithLLM(
  query: string,
  results: any[],
  intent: string,
  topN = 15,
): Promise<any[]> {
  if (results.length < 4) return results

  const toRerank = results.slice(0, topN)
  const list = toRerank
    .map(
      (it, i) =>
        `${i}:${it.name ?? it.title ?? '?'}(${it.result_type}) — ${(it.description ?? '').slice(0, 60)}`,
    )
    .join('\n')

  const systemPrompt = `Expert marketplace tunisienne. Trie ces résultats pour "${query}" (intent:${intent}).
Priorités: 1)Correspondance exacte 2)STORE/ITEM/REEL natifs avant annuaires 3)Rejette hors-sujet.
Réponds UNIQUEMENT avec les indices en ordre décroissant de pertinence, séparés par virgule. Ex: 2,0,5,1`

  try {
    const { text } = await openRouterChat(systemPrompt, list, 120)
    const order = text
      .split(',')
      .map(x => parseInt(x.trim(), 10))
      .filter(x => !isNaN(x) && x >= 0 && x < topN)

    if (order.length < 2) return results

    const reranked  = order.map(i => toRerank[i]).filter(Boolean)
    const seenIdx   = new Set(order)
    const remaining = toRerank.filter((_, i) => !seenIdx.has(i))
    return [...reranked, ...remaining, ...results.slice(topN)]
  } catch {
    return results
  }
}

// ─── Géocodage ────────────────────────────────────────────────────────────────

async function geocodeLocation(location?: string): Promise<{ lat?: number; lng?: number }> {
  const city = extractCity(location)
  if (!city || city.length < 3) return {}

  try {
    const url =
      `https://api.geoapify.com/v1/geocode/search` +
      `?text=${encodeURIComponent(city)}` +
      `&filter=rect:7.522,30.230,11.598,37.340` +  // Tunisia bounding box
      `&limit=1` +
      `&apiKey=${process.env.GEOAPIFY_API_KEY ?? ''}`

    const res  = await fetch(url)
    const data = await res.json()
    if (data?.features?.[0]) {
      return {
        lat: data.features[0].properties.lat,
        lng: data.features[0].properties.lon,
      }
    }
  } catch { /* silently fail — geo is optional */ }
  return {}
}

// ─── Distance Haversine ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Tri final ────────────────────────────────────────────────────────────────

const NATIVE_TYPES = new Set(['STORE', 'ITEM', 'REEL'])

function finalSort(items: any[], isSuggestion: boolean): any[] {
  return items.sort((a, b) => {
    // 1. Mode suggestion: diversité par type
    if (isSuggestion) {
      const TYPE_ORDER: Record<string, number> = {
        STORE: 1, REEL: 2, ITEM: 3, SERVICE_DIR: 4, BUSINESS_DIR: 5,
      }
      const diff = (TYPE_ORDER[a.result_type] ?? 6) - (TYPE_ORDER[b.result_type] ?? 6)
      if (diff !== 0) return diff
    } else {
      // 2. Mode normal: natifs en premier
      const aN = NATIVE_TYPES.has(a.result_type)
      const bN = NATIVE_TYPES.has(b.result_type)
      if (aN !== bN) return aN ? -1 : 1
    }

    // 3. Tri par distance si disponible (différence > 5 km)
    if (a.distance != null && b.distance != null) {
      const diff = a.distance - b.distance
      if (Math.abs(diff) > 5) return diff
    }

    // 4. Rating comme tiebreaker
    const aRating = Number(a.rating_average ?? a.metadata?.rating ?? a.totalScore ?? 0)
    const bRating = Number(b.rating_average ?? b.metadata?.rating ?? b.totalScore ?? 0)
    return bRating - aRating
  })
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export async function doGlobalSemanticSearch(
  query: string,
  location?: string,
  category?: string,
  userLat?: number,
  userLng?: number,
  isSuggestion: boolean = false,
) {
  const cleanQuery = query?.trim()
  if (!cleanQuery || cleanQuery.length < 2) return []

  const cacheKey = `${cleanQuery}|${location ?? ''}|${category ?? ''}|${userLat ?? ''}|${userLng ?? ''}|${isSuggestion}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const t0 = Date.now()
  console.log(`🔍 [Search${isSuggestion ? '/suggest' : ''}] "${cleanQuery}"`)

  // ── Step 1: Script detection + local Darija expansion (sync, free) ──────────

  const script         = detectQueryScript(cleanQuery)
  const darijaWords    = extractDarijaWords(cleanQuery)
  const hint           = darijaWords.map(w => `${w.original}→${w.french}`).join(', ')
  const darijaExp      = expandDarijaQuery(cleanQuery)

  // Shortcut: every word already covered by dictionary → skip LLM
  const fullyTranslated = cleanQuery.split(/\s+/).every(
    w => DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase()] || w.length <= 2,
  )

  const llmFallback: LLMAnalysis = {
    normalized: darijaExp.translated,
    expanded:   darijaExp.expanded,
    intent:     'other',
    category:   darijaExp.detectedCategories[0] ?? '',
  }

  // ── Step 2: Parallélisation maximale ────────────────────────────────────────
  //   LLM + Geocoding + Embedding + Text search — all at once

  // Ultra-fast path for suggestion mode with very short queries
  const skipLLM    = fullyTranslated || (isSuggestion && cleanQuery.length < 5)
  const skipEmbed  = isSuggestion && cleanQuery.length < 4

  const [llmAnalysis, geo, embedding, textResults] = await Promise.all([
    skipLLM
      ? Promise.resolve(llmFallback)
      : withTimeout(
          analyzeQueryWithLLM(cleanQuery, hint, script),
          LLM_TIMEOUT_MS,
          llmFallback,
        ),

    withTimeout(geocodeLocation(location), GEOCODE_TIMEOUT_MS, {}),

    skipEmbed
      ? Promise.resolve([] as number[])
      : withTimeout(
          generateQueryEmbedding(darijaExp.expanded).catch(() =>
            generateQueryEmbedding(darijaExp.translated),
          ),
          EMBED_TIMEOUT_MS,
          [] as number[],
        ),

    // Text search always runs — it's the fastest path
    hybridSearchText(cleanQuery, darijaExp.translated, location, category),
  ])

  const targetLat = userLat ?? (geo as any).lat
  const targetLng = userLng ?? (geo as any).lng

  // ── Step 3: Vector search + linked reels (parallel) ─────────────────────────

  const hasEmbedding = Array.isArray(embedding) && embedding.length > 0

  const [vectorResults, linkedReels] = await Promise.all([
    hasEmbedding
      ? withTimeout(
          hybridSearchVector(embedding as number[], targetLat, targetLng),
          3000,
          [] as any[],
        )
      : Promise.resolve([] as any[]),
    Promise.resolve([] as any[]), // populated after vector results below
  ])

  // Fetch linked reels only after we have vector results (dependent step)
  const reelsFromItems = await withTimeout(
    fetchLinkedReels(vectorResults),
    1500,
    [] as any[],
  )

  // ── Step 4: RRF Fusion ───────────────────────────────────────────────────────

  const fused = reciprocalRankFusion(vectorResults, textResults, reelsFromItems)

  // ── Step 5: Distance annotation ─────────────────────────────────────────────

  if (targetLat && targetLng) {
    for (const item of fused) {
      const lat = Number(item.latitude ?? item.stores?.latitude ?? item.metadata?.latitude ?? 0)
      const lon = Number(item.longitude ?? item.stores?.longitude ?? item.metadata?.longitude ?? 0)
      if (lat && lon) {
        item.distance  = haversineKm(targetLat, targetLng, lat, lon)
        item.is_nearby = item.distance < 15
      }
    }
  }

  // ── Step 6: LLM Reranking (skip in suggestion mode) ─────────────────────────

  const reranked = (!isSuggestion && fused.length > 4)
    ? await withTimeout(
        rerankWithLLM(cleanQuery, fused, llmAnalysis.intent),
        RERANK_TIMEOUT_MS,
        fused,
      )
    : fused

  // ── Step 7: Final sort ───────────────────────────────────────────────────────

  const output = finalSort(reranked, isSuggestion)

  console.log(`✅ [${Date.now() - t0}ms] ${output.length} results — "${cleanQuery}"`)

  // Serialize (removes non-plain objects from server actions)
  const plain = JSON.parse(JSON.stringify(output))
  cacheSet(cacheKey, plain)
  return plain
}

// ─── searchStores ──────────────────────────────────────────────────────────────

export async function searchStores(
  queryStr = '',
  locationStr = '',
  category = '',
): Promise<Business[]> {
  const supabase   = createClient()
  const city       = extractCity(locationStr)
  if (queryStr) logUserSearch(queryStr)

  const translated = translateDarijaForSearch(queryStr)
  const keywords = [
    ...new Set([
      ...translated.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2),
      ...queryStr.toLowerCase().split(/\s+/).filter(
        (w: string) => DARIJA_TUNISIAN_DICTIONARY[w] && w.length > 1,
      ),
    ]),
  ].slice(0, 6)

  const buildOr = (fields: string[]) => buildOrFilter(fields, keywords)

  const storesPromise = (() => {
    let q = supabase
      .from('stores')
      .select('id, name, slug, city, phone, address, category, latitude, longitude, rating_average, total_reviews, logo_url, description')
      .in('status', ['APPROVED', 'PUBLISHED'])
      .is('service_id', null)
    if (keywords.length > 0) q = q.or(buildOr(['name', 'description', 'address']))
    if (city)     q = q.ilike('city', `%${city}%`)
    if (category) q = q.ilike('category', `%${category}%`)
    return q.limit(50)
  })()

  const dirPromise = (() => {
    let q = supabase
      .from('business_directory_tunisia' as any)
      .select('id, title, city, phone, full_address, vitrine_category, categoryName, latitude, longitude, totalScore, reviewsCount, photos')
    if (keywords.length > 0) q = q.or(buildOr(['title', 'categoryName', 'vitrine_category', 'full_address']))
    if (city)     q = q.ilike('city', `%${city}%`)
    if (category) q = q.or(`categoryName.ilike.%${category}%,vitrine_category.ilike.%${category}%`)
    return q.limit(50)
  })()

  const [storesRes, dirRes] = await Promise.all([storesPromise, dirPromise])

  const FALLBACK_IMG =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'

  const results: (Business & { isNative?: boolean })[] = []

  storesRes.data?.forEach((item: any) =>
    results.push({
      isNative:    true,
      id:          item.slug ?? String(item.id),
      name:        item.name ?? '',
      image:       item.logo_url ?? FALLBACK_IMG,
      rating:      Number(item.rating_average) || 0,
      reviewCount: item.total_reviews ?? 0,
      category:    item.category ?? 'Other',
      priceRange:  '$$',
      isOpen:      true,
      description: item.description ?? item.address ?? '',
      location:    {
        address: item.address ?? '',
        lat:     Number(item.latitude) || 36.8065,
        lng:     Number(item.longitude) || 10.1815,
      },
    }),
  )

  dirRes.data?.forEach((item: any) =>
    results.push({
      isNative:    false,
      id:          String(item.id),
      name:        item.title ?? '',
      image:       Array.isArray(item.photos) ? item.photos[0] : FALLBACK_IMG,
      rating:      Number(item.totalScore) || 0,
      reviewCount: item.reviewsCount ?? 0,
      category:    item.vitrine_category ?? item.categoryName ?? 'Other',
      priceRange:  '$$',
      isOpen:      true,
      description: item.full_address ?? '',
      location:    {
        address: item.full_address ?? '',
        lat:     Number(item.latitude) || 36.8065,
        lng:     Number(item.longitude) || 10.1815,
      },
    }),
  )

  results.sort((a, b) =>
    a.isNative === b.isNative ? b.rating - a.rating : a.isNative ? -1 : 1,
  )

  return JSON.parse(JSON.stringify(results.slice(0, 100)))
}

// ─── searchItems ───────────────────────────────────────────────────────────────

export async function searchItems(query?: string, category?: string) {
  const supabase = createClient()
  if (query) logUserSearch(query)

  const translated = query ? translateDarijaForSearch(query) : ''
  const keywords   = translated
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 1)
    .slice(0, 6)

  const isTypeFilter = category === 'PRODUCT' || category === 'SERVICE'

  let req = supabase
    .from('items')
    .select(isTypeFilter ? '*, stores (*)' : '*, stores!inner (*)')
    .eq('status', 'AVAILABLE')
    .not('store_id', 'is', null)

  if (category) {
    if (isTypeFilter) req = req.eq('item_type', category)
    else              req = req.ilike('stores.category', `%${category}%`)
  }

  if (keywords.length > 0) {
    req = req.or(
      keywords.flatMap(kw => [`name.ilike.%${kw}%`, `description.ilike.%${kw}%`]).join(','),
    )
  }

  const { data, error } = await req
    .order('created_at', { ascending: false })
    .limit(100)

  return JSON.parse(
    JSON.stringify({ data: (data as any[]) ?? [], error: error?.message ?? null }),
  )
}

// ─── searchServicesDirectory ───────────────────────────────────────────────────

export async function searchServicesDirectory(
  query?: string,
  location?: string,
  category?: string,
) {
  const supabase = createClient()
  const city     = extractCity(location)

  const translated = query ? translateDarijaForSearch(query) : ''
  const keywords   = translated
    .toLowerCase()
    .split(/\s+/)
    .filter((w: string) => w.length > 2)
    .slice(0, 6)

  const buildOr = (fields: string[]) => buildOrFilter(fields, keywords)

  const sdPromise = (() => {
    let q = supabase
      .from('service_directory')
      .select('*, stores (id, name, rating_average, total_reviews, logo_url)')
      .eq('status', 'ACTIVE')
    if (keywords.length > 0) q = q.or(buildOr(['name', 'description', 'category']))
    if (city)     q = q.ilike('city', `%${city}%`)
    if (category) q = q.ilike('category', `%${category}%`)
    return q.limit(50)
  })()

  const storesPromise = (() => {
    let q = supabase
      .from('stores')
      .select('*')
      .in('status', ['APPROVED', 'PUBLISHED'])
      .is('id_business', null)
    if (keywords.length > 0) q = q.or(buildOr(['name', 'description', 'address']))
    if (city)     q = q.ilike('city', `%${city}%`)
    if (category) q = q.ilike('category', `%${category}%`)
    return q.limit(50)
  })()

  const [sdRes, storesRes] = await Promise.all([sdPromise, storesPromise])

  const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
  const mappedData: any[] = []

  sdRes.data?.forEach((item: any) =>
    mappedData.push({
      ...item,
      isNative:  false,
      id:        item.slug ?? String(item.service_id),
      item_type: 'SERVICE',
      price:     item.price ?? 0,
      main_image: item.stores?.logo_url ?? FALLBACK,
    }),
  )

  storesRes.data?.forEach((item: any) =>
    mappedData.push({
      ...item,
      isNative:  true,
      id:        item.slug ?? String(item.id),
      item_type: 'SERVICE',
      price:     item.price ?? 0,
      main_image: item.logo_url ?? FALLBACK,
      stores:    { name: item.name },
    }),
  )

  return JSON.parse(JSON.stringify({ data: mappedData, error: null }))
}