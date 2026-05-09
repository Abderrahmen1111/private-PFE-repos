'use server'

// ═══════════════════════════════════════════════════════════════
// PIPELINE DE RECHERCHE SÉMANTIQUE GLOBALE — VERSION OPTIMISÉE
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

interface CacheEntry { ts: number; data: any }

// ─── Config ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 1000 * 60 * 15 // 15 min (réduit de 24h → résultats plus frais)
const queryCache = new Map<string, CacheEntry>()

const MODEL_CHAIN = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'openrouter/auto',
]
const QUOTA_CODES = new Set([402, 429, 503])

// ─── Détection de script ──────────────────────────────────────────────────────

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F]/
const LATIN_REGEX  = /[a-zA-Z]/
const DIGIT_REGEX  = /\d/

/**
 * Détecte la langue/script d'une requête pour adapter le traitement
 */
function detectQueryScript(query: string): 'arabic' | 'latin_darija' | 'french' | 'mixed' | 'numeric' {
  if (DIGIT_REGEX.test(query) && !LATIN_REGEX.test(query) && !ARABIC_REGEX.test(query)) return 'numeric'
  const hasArabic = ARABIC_REGEX.test(query)
  const hasLatin  = LATIN_REGEX.test(query)
  if (hasArabic && hasLatin) return 'mixed'
  if (hasArabic) return 'arabic'
  // Vérifie si les mots latins sont dans le dictionnaire Darija
  const words = query.toLowerCase().split(/\s+/)
  const darijaCount = words.filter(w => DARIJA_TUNISIAN_DICTIONARY[w]).length
  if (darijaCount / words.length > 0.3) return 'latin_darija'
  return 'french'
}

// ─── Expansion Darija multi-couche ────────────────────────────────────────────

/**
 * Traduit ET enrichit une requête Darija en français avec synonymes et catégories
 * Retourne plusieurs variantes pour maximiser la couverture sémantique
 */
function expandDarijaQuery(query: string): {
  translated: string
  expanded: string
  variants: string[]
  detectedCategories: string[]
} {
  const words = query.trim().split(/\s+/)
  const translatedWords: string[] = []
  const detectedCategories: Set<string> = new Set()
  const semanticExpansions: string[] = []

  for (const word of words) {
    const normalized = word.toLowerCase().trim()
    const entry = DARIJA_TUNISIAN_DICTIONARY[normalized]
    if (entry) {
      translatedWords.push(entry.french)
      detectedCategories.add(entry.category)
      // Expansion sémantique par catégorie
      const catExpansions = CATEGORY_SEMANTIC_MAP[entry.category]
      if (catExpansions) semanticExpansions.push(...catExpansions)
    } else {
      translatedWords.push(word)
    }
  }

  const translated = translatedWords.join(' ')
  const uniqueExpansions = [...new Set(semanticExpansions)].slice(0, 8)
  const expanded = [translated, ...uniqueExpansions].join(', ')

  // Variantes pour embeddings multiples
  const variants = [
    translated,
    query, // original pour capturer le Darija natif dans les descriptions
    expanded,
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  return {
    translated,
    expanded,
    variants,
    detectedCategories: [...detectedCategories],
  }
}

// Map catégorie → mots-clés sémantiques (améliore le recall)
const CATEGORY_SEMANTIC_MAP: Record<string, string[]> = {
  'verb':         ['action', 'service', 'prestation'],
  'auto':         ['voiture', 'mécanique', 'garage', 'pneu', 'huile', 'révision', 'carrosserie'],
  'nourriture':   ['restaurant', 'traiteur', 'plat', 'cuisine', 'repas', 'livraison', 'menu'],
  'commerce':     ['magasin', 'boutique', 'vente', 'achat', 'marché', 'shop'],
  'beaute':       ['coiffure', 'salon', 'soin', 'esthétique', 'manucure', 'hammam'],
  'santé':        ['médecin', 'clinique', 'pharmacie', 'docteur', 'soins'],
  'mode':         ['vêtements', 'habits', 'prêt-à-porter', 'confection', 'tissu'],
  'lieux':        ['quartier', 'adresse', 'local', 'espace', 'lieu'],
  'transports':   ['taxi', 'livraison', 'transport', 'chauffeur', 'déménagement'],
  'artisanat':    ['fait main', 'traditionnel', 'artisan', 'poterie', 'tissu'],
  'gastronomie':  ['cuisine tunisienne', 'spécialité', 'plat traditionnel'],
  'product':      ['produit', 'article', 'vente', 'achat'],
  'business':     ['entreprise', 'boutique', 'service', 'professionnel'],
  'services':     ['prestataire', 'artisan', 'technicien', 'réparation'],
  'médical':      ['santé', 'médecin', 'clinique', 'pharmacie', 'soins'],
  'éducation':    ['cours', 'formation', 'école', 'enseignement', 'soutien'],
  'finance':      ['banque', 'assurance', 'crédit', 'prêt'],
  'sport':        ['fitness', 'salle', 'coach', 'musculation', 'yoga'],
}

// ─── OpenRouter avec fallback ─────────────────────────────────────────────────

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

// ─── Analyse LLM Darija avancée ───────────────────────────────────────────────

async function analyzeQueryWithLLM(
  query: string,
  hint: string,
  script: string,
): Promise<{ normalized: string; expanded: string; intent: string; category: string }> {
  const systemPrompt = `Tu es un expert en Darija TUNISIEN et en commerce local tunisien.
Analyse cette requête de recherche pour une marketplace tunisienne (Ro2ya).

RÈGLES STRICTES:
1. Darija tunisien: traduis avec précision (ex: "krhba"→"voiture", "nekel"→"manger", "nechri"→"acheter")
2. Code-switch (arabe+français+darija): comprends le mix naturel
3. Requête en arabe: traduis en français
4. Ne jamais halluciner (ex: "krhba" ≠ "chaussures")
5. Si ambigu, utilise ce contexte: ${hint || 'marketplace locale Tunisia'}
6. Script détecté: ${script}

Retourne UNIQUEMENT ce JSON (sans markdown):
{
  "normalized": "traduction courte en français (3-6 mots max)",
  "expanded": "normalized + 8 mots-clés marchands séparés par virgules",
  "intent": "product|service|restaurant|beauty|auto|health|fashion|repair|other",
  "category": "catégorie principale du commerce en français"
}`

  try {
    const { text } = await openRouterChat(systemPrompt, `Requête: "${query}"`, 300)
    const clean = text.replace(/```json|```/g, '').trim()
    const json = JSON.parse(clean)
    return {
      normalized: json.normalized || query,
      expanded: json.expanded || query,
      intent: json.intent || 'other',
      category: json.category || '',
    }
  } catch {
    return { normalized: query, expanded: query, intent: 'other', category: '' }
  }
}

// ─── Recherche texte hybride (ilike multi-table) ──────────────────────────────

function extractCity(location?: string): string {
  if (!location) return ''
  return location.split(',')[0].trim()
}

async function hybridSearchText(
  originalQuery: string,
  normalizedQuery: string,
  location?: string,
  category?: string,
  targetLat?: number,
  targetLng?: number,
): Promise<any[]> {
  const supabase = createClient()
  const cityFilter = extractCity(location)

  // Construire les mots-clés: inclure les variantes Darija ET le texte normalisé
  const rawKeywords = [
    ...normalizedQuery.split(/\s+/),
    ...originalQuery.split(/\s+/).map(w => DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase()]?.french || w),
  ]
  const keywords = [...new Set(rawKeywords)]
    .filter(w => w.length > 2)
    .slice(0, 8) // Limite pour éviter les requêtes trop larges

  if (keywords.length === 0) return []

  // Construction des filtres OR pour chaque mot-clé
  const buildOrFilter = (fields: string[]) =>
    keywords.flatMap(k => fields.map(f => `${f}.ilike.%${k}%`)).join(',')

  const [itemsRes, storesRes, businessRes, servicesRes] = await Promise.all([
    // Items (produits)
    (async () => {
      let q = supabase
        .from('items')
        .select('*, stores!inner(*)')
        .eq('status', 'AVAILABLE')
        .or(buildOrFilter(['name', 'description']))
      if (cityFilter.length > 2) q = q.ilike('stores.city', `%${cityFilter}%`)
      if (category) q = q.ilike('item_type', `%${category}%`)
      return q.limit(25)
    })(),

    // Stores natifs
    (async () => {
      let q = supabase
        .from('stores')
        .select('*')
        .in('status', ['APPROVED', 'PUBLISHED'])
        .or(buildOrFilter(['name', 'description', 'address']))
      if (cityFilter.length > 2) q = q.ilike('city', `%${cityFilter}%`)
      if (category) q = q.ilike('category', `%${category}%`)
      return q.limit(25)
    })(),

    // Annuaire business
    (async () => {
      let q = supabase
        .from('business_directory_tunisia')
        .select('*')
        .or(buildOrFilter(['title', 'description', 'categoryName']))
      if (cityFilter.length > 2) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(25)
    })(),

    // Annuaire services
    (async () => {
      let q = supabase
        .from('service_directory')
        .select('*')
        .eq('status', 'ACTIVE')
        .or(buildOrFilter(['name', 'description', 'category']))
      if (cityFilter.length > 2) q = q.ilike('city', `%${cityFilter}%`)
      return q.limit(25)
    })(),
  ])

  const results: any[] = []

  const addRes = (res: any, type: string, mapFn: (i: any) => any) => {
    if (res.data) {
      res.data.forEach((i: any) => results.push({ ...mapFn(i), result_type: type }))
    }
  }

  addRes(itemsRes, 'ITEM', i => ({
    ...i,
    image_url: i.main_image,
    location_city: i.stores?.city,
    category: i.item_type,
    metadata: { price: i.price, store_name: i.stores?.name },
  }))
  addRes(storesRes, 'STORE', i => ({
    ...i,
    image_url: i.logo_url,
    location_city: i.city,
    metadata: { rating: i.rating_average },
  }))
  addRes(businessRes, 'BUSINESS_DIR', i => ({
    ...i,
    id: i.id,
    name: i.title,
    image_url: i.photos?.[0],
    location_city: i.city,
    metadata: { address: i.full_address },
  }))
  addRes(servicesRes, 'SERVICE_DIR', i => ({
    ...i,
    id: i.service_id,
    image_url: null,
    location_city: i.city,
    metadata: { address: i.address },
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
    match_threshold: 0.15, // Seuil abaissé pour Darija (moins similaire au français)
    match_count: 60,
  })
  if (error) {
    console.error('Vector Search Error:', error)
    return []
  }

  let filtered = data || []
  if (targetLat && targetLng) {
    const delta = 1.2
    filtered = filtered.filter((item: any) => {
      const lat = item.latitude || item.stores?.latitude || item.metadata?.latitude
      const lon = item.longitude || item.stores?.longitude || item.metadata?.longitude
      if (!lat || !lon) return true
      return Math.abs(lat - targetLat) < delta && Math.abs(lon - targetLng) < delta
    })
  }
  return filtered
}

// ─── Fusion Reciprocal Rank (RRF) ─────────────────────────────────────────────

function reciprocalRankFusion(
  vectorResults: any[],
  textResults: any[],
  k = 60,
): any[] {
  const scores = new Map<string, { score: number; item: any }>()
  const add = (list: any[], weight: number) =>
    list.forEach((item, r) => {
      const id = String(item.id ?? `${item.result_type}_${r}`)
      const s = weight / (k + r + 1)
      const e = scores.get(id)
      if (e) e.score += s
      else scores.set(id, { score: s, item })
    })

  // Vector results = plus de poids (comprend le Darija via embeddings multilingues)
  add(vectorResults, 1.4)
  // Text results = poids modéré
  add(textResults, 1.0)

  return [...scores.values()].sort((a, b) => b.score - a.score).map(x => x.item)
}

// ─── Reranking LLM ────────────────────────────────────────────────────────────

async function rerankWithLLM(
  query: string,
  results: any[],
  intent: string,
  topN = 20,
): Promise<any[]> {
  if (results.length < 3) return results

  const toRerank = results.slice(0, topN)
  const systemPrompt = `Tu es un expert en marketplace tunisienne. Trie ces résultats par pertinence pour la requête "${query}" (intention: ${intent}).

CRITÈRES:
1. Correspondance directe avec la requête (priorité maximale)
2. Boutiques natives Ro2ya (STORE/ITEM) avant les annuaires
3. Écarte les résultats hors-sujet
4. Réponds UNIQUEMENT avec les indices séparés par virgules (ex: 0,3,1,5)`

  const list = toRerank
    .map((it, i) => `${i}: ${it.name || it.title} (${it.result_type}) - ${(it.description || '').slice(0, 80)}`)
    .join('\n')

  try {
    const { text } = await openRouterChat(systemPrompt, list, 150)
    const order = text.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x) && x < topN)
    if (order.length < 2) return results
    const reranked = order.map(i => toRerank[i]).filter(Boolean)
    const seen = new Set(order)
    const remaining = toRerank.filter((_, i) => !seen.has(i))
    return [...reranked, ...remaining, ...results.slice(topN)]
  } catch {
    return results
  }
}

// ─── Géocodage ────────────────────────────────────────────────────────────────

async function geocodeLocation(location?: string): Promise<{ lat?: number; lng?: number }> {
  if (!location || location.length < 3) return {}
  const loc = location.toLowerCase()
  if (loc.includes('pres') || loc.includes('près') || loc.includes('moi') || loc.includes('7awli')) return {}

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&filter=rect:7.522,30.230,11.598,37.340&limit=1&apiKey=${process.env.GEOAPIFY_API_KEY || ''}`
    const res = await fetch(url).then(r => r.json())
    if (res?.features?.[0]) {
      return { lat: res.features[0].properties.lat, lng: res.features[0].properties.lon }
    }
  } catch { /* ignoré */ }
  return {}
}

// ─── Distance Haversine ───────────────────────────────────────────────────────

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export async function doGlobalSemanticSearch(
  query: string,
  location?: string,
  category?: string,
  userLat?: number,
  userLng?: number,
  isSuggestion: boolean = false
) {
  const cacheKey = `${query}_${location}_${category}_${userLat}_${userLng}_${isSuggestion}`
  const cached = queryCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data

  console.log(`🔍 [Ro2ya Search${isSuggestion ? ' - Suggest' : ''}] "${query}"`)
  const t0 = Date.now()

  // 1. Détection script + extraction Darija
  const script = detectQueryScript(query)
  const darijaWords = extractDarijaWords(query)
  const hint = darijaWords.map(w => `${w.original}→${w.french}`).join(', ')

  // 2. Expansion Darija locale (rapide, zéro API)
  const darijaExpansion = expandDarijaQuery(query)

  // 3. Fast path: si la requête est déjà bien traduite par le dictionnaire
  const allWordsTranslated = query.split(/\s+/).every(
    w => DARIJA_TUNISIAN_DICTIONARY[w.toLowerCase()] || w.length < 3,
  )

  // 4. Parallélisation: LLM + géocodage + embeddings + text search en même temps
  const [llmAnalysis, geo, embedding, textResults] = await Promise.all([
    // LLM: seulement si on n'est pas en mode suggestion rapide OU si le dico est incomplet
    (allWordsTranslated || (isSuggestion && query.length < 5))
      ? Promise.resolve({
          normalized: darijaExpansion.translated,
          expanded: darijaExpansion.expanded,
          intent: 'other',
          category: darijaExpansion.detectedCategories[0] || '',
        })
      : analyzeQueryWithLLM(query, hint, script),

    // Géocodage de la localisation textuelle
    geocodeLocation(location),

    // Embedding (seulement si pas en mode suggestion ultra-rapide ou si query longue)
    (isSuggestion && query.length < 4) 
      ? Promise.resolve([]) 
      : generateQueryEmbedding(darijaExpansion.expanded).catch(() =>
          generateQueryEmbedding(darijaExpansion.translated)
        ),

    // Recherche textuelle parallèle (TOUJOURS RAPIDE)
    hybridSearchText(
      query,
      darijaExpansion.translated,
      location,
      category,
      userLat,
      userLng,
    ),
  ])

  const targetLat = userLat || geo.lat
  const targetLng = userLng || geo.lng

  // 5. Recherche vectorielle (uniquement si on a un embedding)
  const vectorResults = embedding && embedding.length > 0
    ? await hybridSearchVector(embedding, targetLat, targetLng)
    : []

  // 6. Fusion RRF
  const fused = reciprocalRankFusion(vectorResults, textResults)

  // 7. Calcul des distances
  if (targetLat && targetLng) {
    for (const item of fused) {
      const lat = Number(item.latitude || item.stores?.latitude || item.metadata?.latitude || 0)
      const lon = Number(item.longitude || item.stores?.longitude || item.metadata?.longitude || 0)
      if (lat && lon) {
        item.distance = getDistance(targetLat, targetLng, lat, lon)
        item.is_nearby = item.distance < 15
      }
    }
  }

  // 8. Reranking LLM (DÉSACTIVÉ en mode suggestion pour la vitesse)
  const reranked = (fused.length > 3 && !isSuggestion)
    ? await rerankWithLLM(query, fused, llmAnalysis.intent)
    : fused

  // 9. Tri final
  reranked.sort((a, b) => {
    // En mode suggestion, on veut de la diversité
    if (isSuggestion) {
        const typeOrder = { 'STORE': 1, 'ITEM': 2, 'SERVICE_DIR': 3, 'BUSINESS_DIR': 4 }
        const aOrder = (typeOrder as any)[a.result_type] || 5
        const bOrder = (typeOrder as any)[b.result_type] || 5
        if (aOrder !== bOrder) return aOrder - bOrder
    } else {
        const aIsNative = a.result_type === 'STORE' || a.result_type === 'ITEM'
        const bIsNative = b.result_type === 'STORE' || b.result_type === 'ITEM'
        if (aIsNative !== bIsNative) return aIsNative ? -1 : 1
    }
    
    if (a.distance !== undefined && b.distance !== undefined) {
      if (Math.abs(a.distance - b.distance) > 5) return a.distance - b.distance
    }
    return 0
  })

  console.log(`✅ [${Date.now() - t0}ms] ${reranked.length} résultats pour "${query}"`)

  const plainResults = JSON.parse(JSON.stringify(reranked))
  queryCache.set(cacheKey, { ts: Date.now(), data: plainResults })
  return plainResults
}

// ─── searchStores ──────────────────────────────────────────────────────────────

export async function searchStores(
  queryStr = '',
  locationStr = '',
  category = '',
): Promise<Business[]> {
  const supabase = createClient()
  const city = extractCity(locationStr)
  if (queryStr) logUserSearch(queryStr)

  // Traduire le Darija avant la recherche texte
  const translated = translateDarijaForSearch(queryStr)
  const keywords = [...new Set([
    ...translated.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2),
    ...queryStr.toLowerCase().split(/\s+/).filter((w: string) => DARIJA_TUNISIAN_DICTIONARY[w] && w.length > 1),
  ])]

  const buildOr = (fields: string[], kws: string[]) =>
    kws.flatMap(kw => fields.map(f => `${f}.ilike.%${kw}%`)).join(',')

  let storesQuery = supabase
    .from('stores')
    .select('id, name, slug, city, phone, address, category, latitude, longitude, rating_average, total_reviews, logo_url, description')
    .in('status', ['APPROVED', 'PUBLISHED'])
    .is('service_id', null)

  if (keywords.length > 0) storesQuery = storesQuery.or(buildOr(['name', 'description', 'address'], keywords))
  if (city) storesQuery = storesQuery.ilike('city', `%${city}%`)
  if (category) storesQuery = storesQuery.ilike('category', `%${category}%`)

  let dirQuery = supabase
    .from('business_directory_tunisia' as any)
    .select('id, title, city, phone, full_address, vitrine_category, categoryName, latitude, longitude, totalScore, reviewsCount, photos')

  if (keywords.length > 0) dirQuery = dirQuery.or(buildOr(['title', 'categoryName', 'vitrine_category', 'full_address'], keywords))
  if (city) dirQuery = dirQuery.ilike('city', `%${city}%`)
  if (category) dirQuery = dirQuery.or(`categoryName.ilike.%${category}%,vitrine_category.ilike.%${category}%`)

  const [storesRes, dirRes] = await Promise.all([storesQuery.limit(50), dirQuery.limit(50)])

  const results: (Business & { isNative?: boolean })[] = []
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'

  storesRes.data?.forEach((item: any) => results.push({
    isNative: true,
    id: item.slug || String(item.id),
    name: item.name || '',
    image: item.logo_url || FALLBACK_IMG,
    rating: Number(item.rating_average) || 0,
    reviewCount: item.total_reviews || 0,
    category: item.category || 'Other',
    priceRange: '$$',
    isOpen: true,
    description: item.description || item.address || '',
    location: { address: item.address || '', lat: Number(item.latitude) || 36.8065, lng: Number(item.longitude) || 10.1815 },
  }))

  dirRes.data?.forEach((item: any) => results.push({
    isNative: false,
    id: String(item.id),
    name: item.title || '',
    image: item.photos?.[0] || FALLBACK_IMG,
    rating: Number(item.totalScore) || 0,
    reviewCount: item.reviewsCount || 0,
    category: item.vitrine_category || item.categoryName || 'Other',
    priceRange: '$$',
    isOpen: true,
    description: item.full_address || '',
    location: { address: item.full_address || '', lat: Number(item.latitude) || 36.8065, lng: Number(item.longitude) || 10.1815 },
  }))

  return JSON.parse(JSON.stringify(results
    .sort((a, b) => (a.isNative === b.isNative ? b.rating - a.rating : a.isNative ? -1 : 1))
    .slice(0, 100)))
}

// ─── searchItems ───────────────────────────────────────────────────────────────

export async function searchItems(query?: string, category?: string) {
  const supabase = createClient()
  if (query) logUserSearch(query)

  const translated = query ? translateDarijaForSearch(query) : ''
  const keywords = translated.toLowerCase().split(/\s+/).filter((w: string) => w.length > 1)
  const isTypeFilter = category === 'PRODUCT' || category === 'SERVICE'

  let req = supabase
    .from('items')
    .select(isTypeFilter ? '*, stores (*)' : '*, stores!inner (*)')
    .eq('status', 'AVAILABLE')
    .not('store_id', 'is', null)

  if (category) {
    if (isTypeFilter) req = req.eq('item_type', category)
    else req = req.ilike('stores.category', `%${category}%`)
  }

  if (keywords.length > 0) {
    req = req.or(keywords.flatMap(kw => [`name.ilike.%${kw}%`, `description.ilike.%${kw}%`]).join(','))
  }

  const { data, error } = await req.order('created_at', { ascending: false }).limit(100)
  return JSON.parse(JSON.stringify({ data: (data as any[]) || [], error: error?.message || null }))
}

// ─── searchServicesDirectory ───────────────────────────────────────────────────

export async function searchServicesDirectory(
  query?: string,
  location?: string,
  category?: string,
) {
  const supabase = createClient()
  const city = extractCity(location)
  const translated = query ? translateDarijaForSearch(query) : ''
  const keywords = translated.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2)

  const buildOr = (fields: string[]) =>
    keywords.flatMap(kw => fields.map(f => `${f}.ilike.%${kw}%`)).join(',')

  let sdReq = supabase
    .from('service_directory')
    .select('*, stores (id, name, rating_average, total_reviews, logo_url)')
    .eq('status', 'ACTIVE')

  if (keywords.length > 0) sdReq = sdReq.or(buildOr(['name', 'description', 'category']))
  if (city) sdReq = sdReq.ilike('city', `%${city}%`)
  if (category) sdReq = sdReq.ilike('category', `%${category}%`)

  let storesReq = supabase.from('stores').select('*').in('status', ['APPROVED', 'PUBLISHED']).is('id_business', null)
  if (keywords.length > 0) storesReq = storesReq.or(buildOr(['name', 'description', 'address']))
  if (city) storesReq = storesReq.ilike('city', `%${city}%`)
  if (category) storesReq = storesReq.ilike('category', `%${category}%`)

  const [sdRes, storesRes] = await Promise.all([sdReq.limit(50), storesReq.limit(50)])
  const mappedData: any[] = []
  const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'

  sdRes.data?.forEach((item: any) => mappedData.push({
    ...item,
    isNative: false,
    id: item.slug || String(item.service_id),
    item_type: 'SERVICE',
    price: item.price || 0,
    main_image: item.stores?.logo_url || FALLBACK,
  }))

  storesRes.data?.forEach((item: any) => mappedData.push({
    ...item,
    isNative: true,
    id: item.slug || String(item.id),
    item_type: 'SERVICE',
    price: item.price || 0,
    main_image: item.logo_url || FALLBACK,
    stores: { name: item.name },
  }))

  return JSON.parse(JSON.stringify({ data: mappedData, error: null }))
}
