'use server'

// ═══════════════════════════════════════════════════════════════
// PIPELINE DE RECHERCHE SÉMANTIQUE GLOBALE — VERSION MODULAIRE
// Support natif Darija tunisien + arabe + français + code-switch
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'
import {
  DARIJA_TUNISIAN_DICTIONARY,
  translateDarijaForSearch,
} from '@/lib/darija-dictionary'
import { logUserSearch } from './user-activity'
import { generateQueryEmbedding } from '@/lib/openrouter-embeddings'
import { Item } from './items'

// Pipeline modules
import { normalizeQuery }             from '@/lib/search/normalizer'
import { vectorSearch }               from '@/lib/search/vector-search'
import { hybridSearch, fetchLinkedReels } from '@/lib/search/hybrid-search'
import { rerank }                     from '@/lib/search/reranker'

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

// ─── Config & Cache ───────────────────────────────────────────────────────────

const CACHE_TTL_MS   = 1000 * 60 * 10        // 10 min
const MAX_CACHE_SIZE = 500                    // LRU eviction threshold
const queryCache     = new Map<string, CacheEntry>()

const EMBED_TIMEOUT_MS = 4000

// ─── Utils ────────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ])
}

function cacheSet(key: string, data: any) {
  if (queryCache.size >= MAX_CACHE_SIZE) {
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
  queryCache.delete(key)
  queryCache.set(key, entry)
  return entry.data
}

/** Extrait une ville depuis une chaîne de localisation (utilisé par searchStores) */
function extractCity(location?: string): string {
  if (!location || location.trim().length < 2) return ''
  const loc = location.trim()
  const PROXIMITY_PATTERNS = /\b(près|pres|7awli|moi|me|my|nearby|hna|houni)\b/i
  if (PROXIMITY_PATTERNS.test(loc)) return ''
  const city = loc.split(/[,\-(]/)[0].trim()
  return city.length >= 2 && city.length <= 40 ? city : ''
}

/** Construit un filtre OR Supabase (utilisé par searchStores) */
function buildOrFilter(fields: string[], keywords: string[]): string {
  return keywords
    .slice(0, 5)
    .flatMap(k => fields.map(f => `${f}.ilike.%${k}%`))
    .join(',')
}

// ─── Fonction principale — ORCHESTRATEUR ─────────────────────────────────────

export async function doGlobalSemanticSearch(
  query:        string,
  location?:    string,
  category?:    string,
  userLat?:     number,
  userLng?:     number,
  isSuggestion: boolean = false,
) {
  const cleanQuery = query?.trim()
  if (!cleanQuery || cleanQuery.length < 2) return []

  const cacheKey = `${cleanQuery}|${location ?? ''}|${category ?? ''}|${userLat ?? ''}|${userLng ?? ''}|${isSuggestion}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const t0 = Date.now()
  console.log(`\n🚀 [PIPELINE] Début recherche "${cleanQuery}" (suggestion=${isSuggestion})`)

  // 1. Normalisation
  const normalized = normalizeQuery(cleanQuery)
  if (cleanQuery) logUserSearch(cleanQuery)

  // 2. Embedding
  const skipEmbed = isSuggestion && cleanQuery.length < 4
  let embedding: number[] = []

  if (!skipEmbed) {
    try {
      embedding = await withTimeout(
        generateQueryEmbedding(normalized.expanded),
        EMBED_TIMEOUT_MS,
        [] as number[],
      )
    } catch {
      console.warn('⚠️  [PIPELINE] Embedding échoué — recherche texte seulement')
    }
  }

  // 3 & 4. Vector + Hybrid Search
  const geoFilter = (userLat && userLng) ? { lat: userLat, lng: userLng } : undefined

  const [vectorResults, textResults] = await Promise.all([
    embedding.length > 0
      ? withTimeout(
          vectorSearch(embedding, { threshold: 0.18, limit: 50, geoFilter }),
          3000,
          [] as any[],
        )
      : Promise.resolve([] as any[]),

    hybridSearch({
      originalQuery:   cleanQuery,
      translatedQuery: normalized.translated,
      keywords:        normalized.keywords,
      location,
      category,
    }),
  ])

  const linkedReels = await withTimeout(
    fetchLinkedReels(vectorResults),
    1500,
    [] as any[],
  )

  console.log(`📊 [PIPELINE] vecteur=${vectorResults.length} | texte=${textResults.length} | reels=${linkedReels.length}`)

  // 5. Reranking
  const output = await rerank(vectorResults, textResults, linkedReels, {
    query:        normalized.translated || cleanQuery,
    intent:       normalized.detectedCategories[0] ?? 'other',
    isSuggestion,
  })

  console.log(`✅ [PIPELINE] Terminé en ${Date.now() - t0}ms — ${output.length} résultats pour "${cleanQuery}"`)

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

  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
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

  results.sort((a, b) => a.isNative === b.isNative ? b.rating - a.rating : a.isNative ? -1 : 1)
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

  return JSON.parse(JSON.stringify({ data: (data as any[]) ?? [], error: error?.message ?? null }))
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