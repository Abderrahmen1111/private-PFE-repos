/**
 * ÉTAPE 4 — HYBRID SEARCH (Text ILIKE)
 * Recherche textuelle parallèle sur toutes les tables avec les keywords traduits.
 * Complément de la recherche vectorielle — capte ce que les embeddings ratent.
 */

import { createClient } from '@/lib/supabase/server'
import { SearchResult } from './vector-search'
import { DARIJA_TUNISIAN_DICTIONARY } from '@/lib/darija-dictionary'

export interface HybridSearchOptions {
  originalQuery:   string
  translatedQuery: string
  keywords:        string[]
  location?:       string
  category?:       string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractCity(location?: string): string {
  if (!location || location.trim().length < 2) return ''
  const PROXIMITY = /\b(près|pres|7awli|moi|me|my|nearby|hna|houni)\b/i
  if (PROXIMITY.test(location)) return ''
  const city = location.split(/[,\-(]/)[0].trim()
  return city.length >= 2 && city.length <= 40 ? city : ''
}

function buildOrFilter(fields: string[], keywords: string[]): string {
  return keywords
    .slice(0, 5)
    .flatMap(k => fields.map(f => `${f}.ilike.%${k}%`))
    .join(',')
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export async function hybridSearch(options: HybridSearchOptions): Promise<SearchResult[]> {
  const { originalQuery, translatedQuery, keywords, location, category } = options

  if (keywords.length === 0) return []

  const t0         = Date.now()
  const supabase   = createClient()
  const cityFilter = extractCity(location)

  // Merge keywords originaux + traduits
  const allKeywords = [...new Set([
    ...keywords,
    ...originalQuery.toLowerCase().split(/\s+/).map(
      w => DARIJA_TUNISIAN_DICTIONARY[w]?.french ?? w
    ),
  ])].filter(w => w.length > 2).slice(0, 6)

  const itemFilter  = buildOrFilter(['name', 'description'], allKeywords)
  const storeFilter = buildOrFilter(['name', 'description', 'address'], allKeywords)
  const bizFilter   = buildOrFilter(['title', 'description', 'categoryName'], allKeywords)
  const svcFilter   = buildOrFilter(['name', 'description', 'category'], allKeywords)
  const reelFilter  = buildOrFilter(['title', 'subtitle', 'category'], allKeywords)

  const [itemsRes, storesRes, businessRes, servicesRes, reelsRes] = await Promise.all([
    // Items
    (() => {
      let q = supabase.from('items').select('*, stores!inner(*)').eq('status', 'AVAILABLE').or(itemFilter)
      if (cityFilter) q = q.ilike('stores.city', `%${cityFilter}%`)
      if (category)   q = q.ilike('item_type', `%${category}%`)
      return q.limit(20)
    })(),
    // Stores
    (() => {
      let q = supabase.from('stores').select('*').in('status', ['APPROVED', 'PUBLISHED']).or(storeFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      if (category)   q = q.ilike('category', `%${category}%`)
      return q.limit(20)
    })(),
    // Business directory
    (() => {
      let q = supabase.from('business_directory_tunisia').select('*').or(bizFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(15)
    })(),
    // Service directory
    (() => {
      let q = supabase.from('service_directory').select('*').eq('status', 'ACTIVE').or(svcFilter)
      if (cityFilter) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(15)
    })(),
    // Reels
    (() => {
      let q = supabase.from('reels').select('*, stores!inner(*), reel_stats(*)').eq('status', 'active').or(reelFilter)
      if (cityFilter) q = q.ilike('stores.city', `%${cityFilter}%`)
      return q.limit(15)
    })(),
  ])

  const results: SearchResult[] = []

  const push = (res: { data: any[] | null }, type: string, mapFn: (i: any) => SearchResult) => {
    if (res.data) res.data.forEach(i => results.push({ ...mapFn(i), result_type: type as any }))
  }

  push(itemsRes,    'ITEM',         i => ({ ...i, image_url: i.main_image, location_city: i.stores?.city, category: i.item_type, metadata: { price: i.price, store_name: i.stores?.name } }))
  push(storesRes,   'STORE',        i => ({ ...i, image_url: i.logo_url, location_city: i.city, metadata: { rating: i.rating_average } }))
  push(businessRes, 'BUSINESS_DIR', i => ({ ...i, name: i.title, image_url: Array.isArray(i.photos) ? i.photos[0] : undefined, location_city: i.city, metadata: { address: i.full_address } }))
  push(servicesRes, 'SERVICE_DIR',  i => ({ ...i, id: i.service_id, image_url: undefined, location_city: i.city, metadata: { address: i.address } }))
  push(reelsRes,    'REEL',         i => ({ ...i, name: i.title, image_url: i.media_path, location_city: i.stores?.city, category: i.category, metadata: { store_name: i.stores?.name, views: i.reel_stats?.[0]?.views_count ?? 0 } }))

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📄 [HYBRID SEARCH] ${results.length} résultat(s) texte en ${Date.now() - t0}ms`)
    console.log(`   Keywords: [${allKeywords.join(', ')}]`)
    if (results.length > 0) results.slice(0, 3).forEach((r, i) =>
      console.log(`   [${i}] ${r.result_type}: "${r.name}" — ${r.location_city ?? 'N/A'}`)
    )
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  return results
}

/** Récupère les reels liés aux items trouvés par vector search */
export async function fetchLinkedReels(vectorResults: SearchResult[]): Promise<SearchResult[]> {
  const itemIds = [...new Set(
    vectorResults.filter(r => r.result_type === 'ITEM').map(r => r.id).filter(Boolean)
  )].slice(0, 8)

  if (itemIds.length === 0) return []

  const supabase = createClient()
  const { data: reels } = await supabase
    .from('reels').select('*, stores(*), reel_stats(*)')
    .in('item_id', itemIds as any[]).limit(8)

  if (!reels) return []
  return (reels as any[]).map(reel => ({
    ...reel,
    result_type:   'REEL' as const,
    name:          reel.title,
    image_url:     reel.media_path,
    category:      reel.category ?? undefined,
    location_city: reel.stores?.city,
    metadata:      { 
      store_name: reel.stores?.name, 
      linked_to_item: true, 
      views: (Array.isArray(reel.reel_stats) ? reel.reel_stats[0]?.views_count : reel.reel_stats?.views_count) ?? 0 
    },
  }))
}
