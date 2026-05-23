import { createAdminClient } from '@/lib/supabase/admin'
import { SLIDING_WINDOW_SECS, SLIDING_WINDOW_SIZE } from './constants'
import {
  coldStartIntentDefaults,
  getDominantIntent,
  normalizeProbabilities,
  ruleBasedIntent,
  updateIntentScores,
} from './intent'
import { rankItems } from './scoring'
import { buildFeatureVector } from './signals'
import type {
  BehavioralEvent,
  EventType,
  IntentProbabilities,
  ItemType,
  RankingContext,
  RankingItem,
  ScoredItem,
} from './types'

// ─── Ranking DB row shapes (tables exist outside generated Database types) ─────

interface EventRow {
  user_id: string
  session_id: string
  event_type: string
  item_id?: string | null
  item_type?: string | null
  category?: string | null
  scroll_speed?: number | null
  watch_time?: number | null
  distance_km?: number | null
  has_discount?: boolean | null
  query_length?: number | null
  price?: number | null
  metadata?: Record<string, unknown> | null
  created_at?: string | null
}

interface ItemRankingScoreRow {
  item_id: string
  item_type: string
  views?: number | null
  likes?: number | null
  saves?: number | null
  shares?: number | null
  clicks?: number | null
  engagement_score?: number | null
  quality_score?: number | null
  boost_score?: number | null
}

interface UserIntentStateRow {
  intent_probs?: IntentProbabilities | null
}

interface UserBehavioralProfileRow {
  embedding?: string | number[] | null
  interaction_count?: number | null
}

interface StoreRow {
  id: number
  name: string
  description?: string | null
  category?: string | null
  latitude?: number | null
  longitude?: number | null
  logo_url?: string | null
  rating_average?: number | null
  total_reviews?: number | null
  created_at?: string | null
  opening_hours?: unknown
  embedding?: string | null
  status?: string | null
}

interface ItemRow {
  id: number
  name: string
  description?: string | null
  price?: number | null
  main_image?: string | null
  item_type?: string | null
  rating_average?: number | null
  total_reviews?: number | null
  view_count?: number | null
  created_at?: string | null
  embedding?: string | null
  status?: string | null
  store_id?: number | null
  stores?: { name?: string | null; category?: string | null } | null
}

interface ReelRow {
  id: number
  title: string
  subtitle?: string | null
  category?: string | null
  price?: number | null
  media_path?: string | null
  created_at?: string | null
  is_sponsored?: boolean | null
  embedding?: string | null
  status?: string | null
  store_id?: number | null
  stores?: { name?: string | null } | null
}

const DEFAULT_FEED_LIMIT = 20
const DEFAULT_CANDIDATE_LIMIT = 120
const ALL_ITEM_TYPES: ItemType[] = ['business', 'product', 'service', 'reel']

const EVENT_COUNTER_MAP: Partial<Record<EventType, keyof ItemRankingScoreRow>> = {
  view: 'views',
  like: 'likes',
  save: 'saves',
  share: 'shares',
  click: 'clicks',
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

/** Ranking tables are not in generated `Database` types yet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRankingDb(): any {
  return createAdminClient()
}

function parseEmbedding(value: unknown): number[] | undefined {
  if (!value) return undefined
  if (Array.isArray(value)) {
    return value.map((v) => Number(v)).filter((v) => Number.isFinite(v))
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed.startsWith('[')) return undefined
    try {
      const parsed = JSON.parse(trimmed) as unknown[]
      return parsed.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    } catch {
      return undefined
    }
  }
  return undefined
}

function toEventType(value: string): EventType {
  return value as EventType
}

function toItemType(value: string): ItemType | null {
  const normalized = value.toLowerCase()
  if (ALL_ITEM_TYPES.includes(normalized as ItemType)) {
    return normalized as ItemType
  }
  if (normalized === 'store' || normalized === 'business') return 'business'
  if (normalized === 'product') return 'product'
  if (normalized === 'service') return 'service'
  if (normalized === 'reel') return 'reel'
  return null
}

function mapEventRow(row: EventRow): BehavioralEvent {
  return {
    user_id: row.user_id,
    session_id: row.session_id,
    event_type: toEventType(row.event_type),
    item_id: row.item_id ?? undefined,
    item_type: row.item_type ? (toItemType(row.item_type) ?? undefined) : undefined,
    category: row.category ?? undefined,
    scroll_speed: row.scroll_speed ?? undefined,
    watch_time: row.watch_time ?? undefined,
    distance_km: row.distance_km ?? undefined,
    has_discount: row.has_discount ?? undefined,
    query_length: row.query_length ?? undefined,
    price: row.price ?? undefined,
    metadata: {
      ...(row.metadata ?? {}),
      ...(row.created_at ? { created_at: row.created_at } : {}),
    },
  }
}

function recomputeEngagementScore(stats: {
  views: number
  likes: number
  saves: number
  shares: number
}): number {
  const views = Math.max(stats.views, 1)
  return (stats.likes + stats.saves + stats.shares) / views
}

function isNewByDate(createdAt?: string | null): boolean {
  if (!createdAt) return false
  const created = Date.parse(createdAt)
  if (Number.isNaN(created)) return false
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24)
  return ageDays < 30
}

function scoreRowToMetrics(row: ItemRankingScoreRow) {
  return {
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    saves: row.saves ?? 0,
    shares: row.shares ?? 0,
  }
}

// ─── Internal data access ─────────────────────────────────────────────────────

async function fetchRecentEvents(
  userId: string,
  sessionId: string
): Promise<BehavioralEvent[]> {
  const supabase = getRankingDb()
  const cutoff = new Date(Date.now() - SLIDING_WINDOW_SECS * 1000).toISOString()

  const { data, error } = await supabase
    .from('events')
    .select(
      'user_id, session_id, event_type, item_id, item_type, category, scroll_speed, watch_time, distance_km, has_discount, query_length, price, metadata, created_at'
    )
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(SLIDING_WINDOW_SIZE * 3)

  if (error) {
    console.error('[ranking/feed] fetchRecentEvents:', error.message)
    return []
  }

  return (data as EventRow[] | null)?.map(mapEventRow) ?? []
}

async function fetchUserEmbedding(userId: string): Promise<number[] | undefined> {
  const supabase = getRankingDb()

  const { data, error } = await supabase
    .from('user_behavioral_profile')
    .select('embedding')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[ranking/feed] fetchUserEmbedding:', error.message)
    return undefined
  }

  return parseEmbedding((data as UserBehavioralProfileRow | null)?.embedding)
}

async function fetchStoredIntentProbs(
  userId: string,
  sessionId: string
): Promise<IntentProbabilities | null> {
  const supabase = getRankingDb()

  const { data, error } = await supabase
    .from('user_intent_state')
    .select('intent_probs')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('[ranking/feed] fetchStoredIntentProbs:', error.message)
    return null
  }

  const probs = (data as UserIntentStateRow | null)?.intent_probs
  return probs ?? null
}

async function storeIntentState(
  userId: string,
  sessionId: string,
  intentProbs: IntentProbabilities,
  features: ReturnType<typeof buildFeatureVector>
): Promise<void> {
  const supabase = getRankingDb()

  const { error } = await supabase.from('user_intent_state').upsert(
    {
      user_id: userId,
      session_id: sessionId,
      intent_probs: intentProbs,
      dominant_intent: getDominantIntent(intentProbs),
      feature_vector: features,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,session_id' }
  )

  if (error) {
    console.error('[ranking/feed] storeIntentState:', error.message)
  }
}

function computeIntentProbabilities(
  events: BehavioralEvent[],
  storedProbs: IntentProbabilities | null
): { intentProbs: IntentProbabilities; features: ReturnType<typeof buildFeatureVector> } {
  const features = buildFeatureVector(events)
  const ruleProbs = ruleBasedIntent(features)

  let sequentialProbs = storedProbs ?? coldStartIntentDefaults()
  for (const event of events) {
    sequentialProbs = updateIntentScores(sequentialProbs, event.event_type)
  }

  const blended = {
    SEARCH: 0.5 * ruleProbs.SEARCH + 0.5 * sequentialProbs.SEARCH,
    DISCOVERY: 0.5 * ruleProbs.DISCOVERY + 0.5 * sequentialProbs.DISCOVERY,
    PROBLEM: 0.5 * ruleProbs.PROBLEM + 0.5 * sequentialProbs.PROBLEM,
    PASSIVE: 0.5 * ruleProbs.PASSIVE + 0.5 * sequentialProbs.PASSIVE,
    DEAL: 0.5 * ruleProbs.DEAL + 0.5 * sequentialProbs.DEAL,
    REENGAGEMENT: 0.5 * ruleProbs.REENGAGEMENT + 0.5 * sequentialProbs.REENGAGEMENT,
    TRANSACTION: 0.5 * ruleProbs.TRANSACTION + 0.5 * sequentialProbs.TRANSACTION,
  }

  return { intentProbs: normalizeProbabilities(blended), features }
}

// ─── Candidate hydration ────────────────────────────────────────────────────────

type RankingItemWithMetrics = RankingItem & {
  likes?: number
  saves?: number
  shares?: number
  views?: number
}

function buildRankingItemBase(
  id: string,
  type: ItemType,
  scoreRow: ItemRankingScoreRow | undefined,
  fields: Omit<
    RankingItem,
    'id' | 'type' | 'engagement_score' | 'quality_score' | 'boost_score'
  >,
  extraViews?: number
): RankingItemWithMetrics {
  const metrics = scoreRow ? scoreRowToMetrics(scoreRow) : { views: 0, likes: 0, saves: 0, shares: 0 }

  return {
    id,
    type,
    ...fields,
    engagement_score:
      scoreRow?.engagement_score ?? recomputeEngagementScore(metrics),
    quality_score: scoreRow?.quality_score ?? 0,
    boost_score: scoreRow?.boost_score ?? 0,
    likes: metrics.likes,
    saves: metrics.saves,
    shares: metrics.shares,
    views: extraViews ?? metrics.views,
  }
}

async function hydrateStores(
  ids: string[],
  scoreMap: Map<string, ItemRankingScoreRow>
): Promise<RankingItem[]> {
  if (ids.length === 0) return []

  const supabase = getRankingDb()
  const numericIds = ids.map(Number).filter((id) => Number.isFinite(id))
  if (numericIds.length === 0) return []

  const { data, error } = await supabase
    .from('stores')
    .select(
      'id, name, description, category, latitude, longitude, logo_url, rating_average, total_reviews, created_at, opening_hours, status'
    )
    .in('id', numericIds)
    .eq('status', 'PUBLISHED')

  if (error) {
    console.error('[ranking/feed] hydrateStores:', error.message)
    return []
  }

  return (data as StoreRow[]).map((store) => {
    const id = String(store.id)
    const score = scoreMap.get(`business:${id}`) ?? scoreMap.get(id)

    return buildRankingItemBase(id, 'business', score, {
      title: store.name,
      description: store.description ?? undefined,
      category: store.category ?? undefined,
      avg_rating: store.rating_average ?? undefined,
      review_count: store.total_reviews ?? undefined,
      coordinates:
        store.latitude != null && store.longitude != null
          ? { lat: Number(store.latitude), lng: Number(store.longitude) }
          : undefined,
      created_at: store.created_at ?? new Date().toISOString(),
      image_url: store.logo_url ?? undefined,
      is_new_merchant: isNewByDate(store.created_at),
    })
  })
}

async function hydrateItems(
  ids: string[],
  type: 'product' | 'service',
  scoreMap: Map<string, ItemRankingScoreRow>
): Promise<RankingItem[]> {
  if (ids.length === 0) return []

  const supabase = getRankingDb()
  const numericIds = ids.map(Number).filter((id) => Number.isFinite(id))
  if (numericIds.length === 0) return []

  const itemTypeFilter = type === 'product' ? 'PRODUCT' : 'SERVICE'

  const { data, error } = await supabase
    .from('items')
    .select(
      'id, name, description, price, main_image, item_type, rating_average, total_reviews, view_count, created_at, embedding, status, store_id, stores(name, category)'
    )
    .in('id', numericIds)
    .eq('item_type', itemTypeFilter)
    .eq('status', 'AVAILABLE')

  if (error) {
    console.error('[ranking/feed] hydrateItems:', error.message)
    return []
  }

  return (data as ItemRow[]).map((item) => {
    const id = String(item.id)
    const score = scoreMap.get(`${type}:${id}`) ?? scoreMap.get(id)

    return buildRankingItemBase(
      id,
      type,
      score,
      {
        title: item.name,
        description: item.description ?? undefined,
        category: item.stores?.category ?? item.item_type ?? undefined,
        price: item.price != null ? Number(item.price) : undefined,
        avg_rating: item.rating_average ?? undefined,
        review_count: item.total_reviews ?? undefined,
        created_at: item.created_at ?? new Date().toISOString(),
        image_url: item.main_image ?? undefined,
        merchant_name: item.stores?.name ?? undefined,
        is_new_merchant: isNewByDate(item.created_at),
        content_embedding: parseEmbedding(item.embedding),
      },
      item.view_count ?? undefined
    )
  })
}

async function hydrateReels(
  ids: string[],
  scoreMap: Map<string, ItemRankingScoreRow>
): Promise<RankingItem[]> {
  if (ids.length === 0) return []

  const supabase = getRankingDb()
  const numericIds = ids.map(Number).filter((id) => Number.isFinite(id))
  if (numericIds.length === 0) return []

  const { data, error } = await supabase
    .from('reels')
    .select(
      'id, title, subtitle, category, price, media_path, created_at, is_sponsored, status, store_id, stores(name)'
    )
    .in('id', numericIds)
    .eq('status', 'active')

  if (error) {
    console.error('[ranking/feed] hydrateReels:', error.message)
    return []
  }

  return (data as ReelRow[]).map((reel) => {
    const id = String(reel.id)
    const score = scoreMap.get(`reel:${id}`) ?? scoreMap.get(id)

    return buildRankingItemBase(id, 'reel', score, {
      title: reel.title,
      description: reel.subtitle ?? undefined,
      category: reel.category ?? undefined,
      price: reel.price != null ? Number(reel.price) : undefined,
      created_at: reel.created_at ?? new Date().toISOString(),
      image_url: reel.media_path ?? undefined,
      merchant_name: reel.stores?.name ?? undefined,
      is_promoted: reel.is_sponsored ?? false,
      is_new_merchant: isNewByDate(reel.created_at),
    })
  })
}

async function fallbackCandidatesFromCatalog(
  types: ItemType[],
  limit: number
): Promise<RankingItem[]> {
  const supabase = getRankingDb()
  const perType = Math.ceil(limit / types.length)
  const results: RankingItem[] = []

  if (types.includes('business')) {
    const { data } = await supabase
      .from('stores')
      .select('id, name, description, category, latitude, longitude, logo_url, rating_average, total_reviews, created_at')
      .eq('status', 'PUBLISHED')
      .order('view_count', { ascending: false })
      .limit(perType)

    for (const store of (data as StoreRow[] | null) ?? []) {
      results.push(
        buildRankingItemBase(String(store.id), 'business', undefined, {
          title: store.name,
          description: store.description ?? undefined,
          category: store.category ?? undefined,
          avg_rating: store.rating_average ?? undefined,
          review_count: store.total_reviews ?? undefined,
          coordinates:
            store.latitude != null && store.longitude != null
              ? { lat: Number(store.latitude), lng: Number(store.longitude) }
              : undefined,
          created_at: store.created_at ?? new Date().toISOString(),
          image_url: store.logo_url ?? undefined,
          is_new_merchant: isNewByDate(store.created_at),
        })
      )
    }
  }

  if (types.includes('product') || types.includes('service')) {
    const itemTypes: ('PRODUCT' | 'SERVICE')[] = []
    if (types.includes('product')) itemTypes.push('PRODUCT')
    if (types.includes('service')) itemTypes.push('SERVICE')

    const { data } = await supabase
      .from('items')
      .select(
        'id, name, description, price, main_image, item_type, rating_average, total_reviews, view_count, created_at, embedding, stores(name, category)'
      )
      .in('item_type', itemTypes)
      .eq('status', 'AVAILABLE')
      .order('view_count', { ascending: false })
      .limit(perType * itemTypes.length)

    for (const item of (data as ItemRow[] | null) ?? []) {
      const mappedType: ItemType =
        item.item_type === 'SERVICE' ? 'service' : 'product'
      if (!types.includes(mappedType)) continue

      results.push(
        buildRankingItemBase(
          String(item.id),
          mappedType,
          undefined,
          {
            title: item.name,
            description: item.description ?? undefined,
            category: item.stores?.category ?? undefined,
            price: item.price != null ? Number(item.price) : undefined,
            avg_rating: item.rating_average ?? undefined,
            review_count: item.total_reviews ?? undefined,
            created_at: item.created_at ?? new Date().toISOString(),
            image_url: item.main_image ?? undefined,
            merchant_name: item.stores?.name ?? undefined,
            is_new_merchant: isNewByDate(item.created_at),
            content_embedding: parseEmbedding(item.embedding),
          },
          item.view_count ?? undefined
        )
      )
    }
  }

  if (types.includes('reel')) {
    const { data } = await supabase
      .from('reels')
      .select('id, title, subtitle, category, price, media_path, created_at, is_sponsored, stores(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(perType)

    for (const reel of (data as ReelRow[] | null) ?? []) {
      results.push(
        buildRankingItemBase(String(reel.id), 'reel', undefined, {
          title: reel.title,
          description: reel.subtitle ?? undefined,
          category: reel.category ?? undefined,
          price: reel.price != null ? Number(reel.price) : undefined,
          created_at: reel.created_at ?? new Date().toISOString(),
          image_url: reel.media_path ?? undefined,
          merchant_name: reel.stores?.name ?? undefined,
          is_promoted: reel.is_sponsored ?? false,
          is_new_merchant: isNewByDate(reel.created_at),
        })
      )
    }
  }

  return results
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchCandidateItems(options: {
  types?: ItemType[]
  limit?: number
  userId: string
}): Promise<RankingItem[]> {
  const types = options.types?.length ? options.types : ALL_ITEM_TYPES
  const limit = options.limit ?? DEFAULT_CANDIDATE_LIMIT
  const supabase = getRankingDb()

  const { data: scoreRows, error } = await supabase
    .from('item_ranking_scores')
    .select(
      'item_id, item_type, views, likes, saves, shares, clicks, engagement_score, quality_score, boost_score'
    )
    .in('item_type', types)
    .order('engagement_score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[ranking/feed] fetchCandidateItems scores:', error.message)
    return fallbackCandidatesFromCatalog(types, limit)
  }

  const rows = (scoreRows as ItemRankingScoreRow[] | null) ?? []
  if (rows.length === 0) {
    return fallbackCandidatesFromCatalog(types, limit)
  }

  const scoreMap = new Map<string, ItemRankingScoreRow>()
  const idsByType: Record<ItemType, string[]> = {
    business: [],
    product: [],
    service: [],
    reel: [],
  }

  for (const row of rows) {
    const itemType = toItemType(row.item_type)
    if (!itemType || !types.includes(itemType)) continue

    scoreMap.set(`${itemType}:${row.item_id}`, row)
    scoreMap.set(row.item_id, row)
    idsByType[itemType].push(row.item_id)
  }

  const [businesses, products, services, reels] = await Promise.all([
    types.includes('business')
      ? hydrateStores(idsByType.business, scoreMap)
      : Promise.resolve([]),
    types.includes('product')
      ? hydrateItems(idsByType.product, 'product', scoreMap)
      : Promise.resolve([]),
    types.includes('service')
      ? hydrateItems(idsByType.service, 'service', scoreMap)
      : Promise.resolve([]),
    types.includes('reel') ? hydrateReels(idsByType.reel, scoreMap) : Promise.resolve([]),
  ])

  const hydrated = [...businesses, ...products, ...services, ...reels]

  if (hydrated.length === 0) {
    return fallbackCandidatesFromCatalog(types, limit)
  }

  return hydrated.slice(0, limit)
}

export async function generateRankedFeed(
  userId: string,
  sessionId: string,
  options: {
    query?: string
    location?: { lat: number; lng: number }
    limit?: number
    offset?: number
    types?: ItemType[]
  } = {}
): Promise<{ items: ScoredItem[]; intent_probs: IntentProbabilities }> {
  const limit = options.limit ?? DEFAULT_FEED_LIMIT
  const offset = options.offset ?? 0
  const types = options.types?.length ? options.types : ALL_ITEM_TYPES

  const [events, storedIntent, userEmbedding] = await Promise.all([
    fetchRecentEvents(userId, sessionId),
    fetchStoredIntentProbs(userId, sessionId),
    fetchUserEmbedding(userId),
  ])

  const { intentProbs, features } = computeIntentProbabilities(events, storedIntent)

  const candidates = await fetchCandidateItems({
    types,
    limit: Math.max(limit + offset, DEFAULT_CANDIDATE_LIMIT),
    userId,
  })

  const context: RankingContext = {
    user_id: userId,
    session_id: sessionId,
    query: options.query,
    location: options.location,
    intent_probs: intentProbs,
    user_embedding: userEmbedding,
  }

  const ranked = rankItems(candidates, context)

  await storeIntentState(userId, sessionId, intentProbs, features)

  return {
    items: ranked.slice(offset, offset + limit),
    intent_probs: intentProbs,
  }
}

export async function updateItemRankingStats(
  itemId: string,
  itemType: ItemType,
  eventType: EventType
): Promise<void> {
  const counterKey = EVENT_COUNTER_MAP[eventType]
  if (!counterKey) return

  const supabase = getRankingDb()

  const { data: existing, error: fetchError } = await supabase
    .from('item_ranking_scores')
    .select(
      'item_id, item_type, views, likes, saves, shares, clicks, engagement_score, quality_score, boost_score'
    )
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .maybeSingle()

  if (fetchError) {
    console.error('[ranking/feed] updateItemRankingStats fetch:', fetchError.message)
    return
  }

  const current = (existing as ItemRankingScoreRow | null) ?? {
    item_id: itemId,
    item_type: itemType,
    views: 0,
    likes: 0,
    saves: 0,
    shares: 0,
    clicks: 0,
    quality_score: 0,
    boost_score: 0,
  }

  const metrics = scoreRowToMetrics(current)
  const nextMetrics = { ...metrics }
  if (counterKey === 'views') nextMetrics.views += 1
  if (counterKey === 'likes') nextMetrics.likes += 1
  if (counterKey === 'saves') nextMetrics.saves += 1
  if (counterKey === 'shares') nextMetrics.shares += 1

  const nextClicks =
    counterKey === 'clicks' ? (current.clicks ?? 0) + 1 : current.clicks ?? 0

  const engagement_score = recomputeEngagementScore(nextMetrics)

  const { error: upsertError } = await supabase.from('item_ranking_scores').upsert(
    {
      item_id: itemId,
      item_type: itemType,
      views: nextMetrics.views,
      likes: nextMetrics.likes,
      saves: nextMetrics.saves,
      shares: nextMetrics.shares,
      clicks: nextClicks,
      engagement_score,
      quality_score: current.quality_score ?? 0,
      boost_score: current.boost_score ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'item_id,item_type' }
  )

  if (upsertError) {
    console.error('[ranking/feed] updateItemRankingStats upsert:', upsertError.message)
  }
}

export async function recordFeedback(
  userId: string,
  itemId: string,
  displayedRank: number,
  calculatedScore: number,
  intentProbs: IntentProbabilities,
  action?: string
): Promise<void> {
  const supabase = getRankingDb()

  const { error } = await supabase.from('ranking_feedback').insert({
    user_id: userId,
    item_id: itemId,
    displayed_rank: displayedRank,
    calculated_score: calculatedScore,
    intent_probs: intentProbs,
    action: action ?? null,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[ranking/feed] recordFeedback:', error.message)
  }
}
