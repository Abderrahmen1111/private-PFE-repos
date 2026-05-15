/**
 * ÉTAPE 3 — VECTOR SEARCH
 * Appelle le RPC Supabase `search_global_semantic` (pgvector cosine similarity)
 * Cherche dans: stores, items, business_directory, service_directory, reels
 */

import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  id:             number | string
  name:           string
  description?:   string
  result_type:    'STORE' | 'ITEM' | 'REEL' | 'BUSINESS_DIR' | 'SERVICE_DIR'
  image_url?:     string
  similarity?:    number
  location_city?: string
  category?:      string
  metadata?:      Record<string, any>
  distance?:      number
  is_nearby?:     boolean
  [key: string]:  any
}

export interface VectorSearchOptions {
  threshold?: number  // Default: 0.18
  limit?:     number  // Default: 50
  geoFilter?: { lat: number; lng: number; deltaDeg?: number }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function vectorSearch(embedding: number[], options: VectorSearchOptions = {}): Promise<SearchResult[]> {
  const { threshold = 0.18, limit = 50, geoFilter } = options

  if (!embedding || embedding.length === 0) {
    console.warn('⚠️  [VECTOR SEARCH] Embedding vide — étape ignorée')
    return []
  }

  const t0 = Date.now()
  const supabase = createClient()

  const { data, error } = await supabase.rpc('search_global_semantic' as any, {
    query_embedding: `[${embedding.join(',')}]`,
    match_threshold: threshold,
    match_count:     limit,
  })

  if (error) {
    console.error('[VECTOR SEARCH] Erreur RPC:', error.message)
    return []
  }

  let results: SearchResult[] = (data ?? []) as SearchResult[]

  if (geoFilter) {
    const { lat, lng, deltaDeg = 1.1 } = geoFilter
    results = results.filter(item => {
      const iLat = Number(item.latitude ?? item.stores?.latitude ?? 0)
      const iLon = Number(item.longitude ?? item.stores?.longitude ?? 0)
      if (!iLat || !iLon) return true
      return Math.abs(iLat - lat) <= deltaDeg && Math.abs(iLon - lng) <= deltaDeg
    })
    for (const item of results) {
      const iLat = Number(item.latitude ?? item.stores?.latitude ?? 0)
      const iLon = Number(item.longitude ?? item.stores?.longitude ?? 0)
      if (iLat && iLon) {
        item.distance  = haversineKm(lat, lng, iLat, iLon)
        item.is_nearby = item.distance < 15
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🔍 [VECTOR SEARCH] ${results.length} résultat(s) en ${Date.now() - t0}ms (seuil: ${threshold})`)
    if (results.length === 0) console.log('   ⚠️  Embeddings stores/items peut-être vides en DB')
    else results.slice(0, 5).forEach((r, i) =>
      console.log(`   [${i}] ${r.result_type}: "${r.name}" sim=${r.similarity?.toFixed(4) ?? 'N/A'}`)
    )
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  return results
}
