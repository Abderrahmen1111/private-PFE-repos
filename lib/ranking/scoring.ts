import { EPSILON, FRESHNESS_LAMBDA, INTENT_WEIGHTS } from './constants'
import type {
  IntentMode,
  RankingContext,
  RankingItem,
  ScoredItem,
} from './types'

const INTENT_MODES: IntentMode[] = [
  'SEARCH',
  'DISCOVERY',
  'PROBLEM',
  'PASSIVE',
  'DEAL',
  'REENGAGEMENT',
  'TRANSACTION',
]

const RELEVANCE_ALPHA = 0.4
const NEW_MERCHANT_DAYS = 30
const EARTH_RADIUS_KM = 6371

type ItemEngagementMetrics = RankingItem & {
  likes?: number
  saves?: number
  shares?: number
  views?: number
}

interface DimensionScores {
  relevance: number
  engagement: number
  proximity: number
  freshness: number
  personalization: number
  businessBoost: number
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/** Map cosine [-1, 1] → [0, 1]. */
export function cosineToUnitScore(similarity: number): number {
  return clamp01((similarity + 1) / 2)
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function hoursSinceCreation(createdAt: string): number {
  const created = Date.parse(createdAt)
  if (Number.isNaN(created)) return 0
  return Math.max((Date.now() - created) / (1000 * 60 * 60), 0)
}

function isNewMerchant(item: RankingItem): boolean {
  if (item.is_new_merchant) return true
  return hoursSinceCreation(item.created_at) < NEW_MERCHANT_DAYS * 24
}

// ─── BM25-like lexical relevance ──────────────────────────────────────────────

function termFrequency(term: string, tokens: string[]): number {
  return tokens.filter((t) => t === term).length
}

function bm25LikeScore(
  query: string,
  title: string,
  description?: string
): number {
  const queryTerms = tokenize(query)
  if (queryTerms.length === 0) return 0

  const docTokens = tokenize(`${title} ${description ?? ''}`)
  if (docTokens.length === 0) return 0

  const k1 = 1.2
  const b = 0.75
  const avgDocLen = 80
  const docLen = docTokens.length

  let raw = 0
  for (const term of queryTerms) {
    const tf = termFrequency(term, docTokens)
    if (tf === 0) continue

    const idf = Math.log(1 + (1.5 + 1) / (0.5 + tf))
    const tfNorm =
      (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)))
    raw += idf * tfNorm
  }

  return clamp01(1 - Math.exp(-raw / 4))
}

// ─── Dimension scorers ────────────────────────────────────────────────────────

export function computeRelevanceScore(
  item: RankingItem,
  query?: string,
  userEmbedding?: number[]
): number {
  const hasQuery = Boolean(query?.trim())
  const hasEmbeddings =
    Boolean(userEmbedding?.length) &&
    Boolean(item.content_embedding?.length)

  if (!hasQuery && !hasEmbeddings) return 0

  const lexical = hasQuery
    ? bm25LikeScore(query!.trim(), item.title, item.description)
    : 0

  const semantic =
    hasEmbeddings && userEmbedding && item.content_embedding
      ? cosineToUnitScore(
          cosineSimilarity(userEmbedding, item.content_embedding)
        )
      : 0

  if (hasQuery && hasEmbeddings) {
    return clamp01(
      RELEVANCE_ALPHA * lexical + (1 - RELEVANCE_ALPHA) * semantic
    )
  }

  return hasQuery ? lexical : semantic
}

export function computeEngagementScore(item: RankingItem): number {
  const extended = item as ItemEngagementMetrics

  let engagementRate: number
  if (
    extended.likes !== undefined ||
    extended.saves !== undefined ||
    extended.shares !== undefined ||
    extended.views !== undefined
  ) {
    const likes = extended.likes ?? 0
    const saves = extended.saves ?? 0
    const shares = extended.shares ?? 0
    const views = Math.max(extended.views ?? 1, 1)
    engagementRate = (likes + saves + shares) / views
  } else {
    engagementRate = item.engagement_score
  }

  return clamp01(Math.tanh(engagementRate * 10))
}

export function computeProximityScore(
  item: RankingItem,
  userLocation?: { lat: number; lng: number }
): number {
  if (!userLocation || !item.coordinates) return 0.5

  const distanceKm = haversineDistanceKm(
    userLocation.lat,
    userLocation.lng,
    item.coordinates.lat,
    item.coordinates.lng
  )

  return clamp01(1 / (distanceKm + 1))
}

export function computeFreshnessScore(
  item: RankingItem,
  lambda: number = FRESHNESS_LAMBDA
): number {
  const hours = hoursSinceCreation(item.created_at)
  return clamp01(Math.exp(-lambda * hours))
}

export function computePersonalizationScore(
  item: RankingItem,
  userEmbedding?: number[]
): number {
  if (!userEmbedding?.length || !item.content_embedding?.length) {
    return 0.3
  }

  return cosineToUnitScore(
    cosineSimilarity(userEmbedding, item.content_embedding)
  )
}

export function computeBusinessBoostScore(item: RankingItem): number {
  const promoted = item.is_promoted === true
  const isNew = isNewMerchant(item)

  if (promoted && isNew) return 1.0
  if (promoted) return 0.8
  if (isNew) return 0.5
  return 0.0
}

// ─── Intent-level fusion ────────────────────────────────────────────────────────

function computeDimensionScores(
  item: RankingItem,
  context: RankingContext
): DimensionScores {
  return {
    relevance: computeRelevanceScore(
      item,
      context.query,
      context.user_embedding
    ),
    engagement: computeEngagementScore(item),
    proximity: computeProximityScore(item, context.location),
    freshness: computeFreshnessScore(item),
    personalization: computePersonalizationScore(
      item,
      context.user_embedding
    ),
    businessBoost: computeBusinessBoostScore(item),
  }
}

export function computeIntentScore(
  item: RankingItem,
  intentMode: IntentMode,
  context: RankingContext
): number {
  return computeIntentScoreWithDimensions(
    item,
    intentMode,
    computeDimensionScores(item, context)
  )
}

function computeIntentScoreWithDimensions(
  item: RankingItem,
  intentMode: IntentMode,
  dims: DimensionScores
): number {
  const weights = INTENT_WEIGHTS[intentMode]
  let score = 0

  if (intentMode === 'DEAL') {
    score =
      weights.engagement * dims.engagement +
      weights.proximity * dims.proximity +
      weights.freshness * dims.freshness +
      weights.personalization * dims.personalization +
      weights.business_boost * dims.businessBoost +
      ((item.discount_pct ?? 0) / 100) * 0.35
  } else {
    score =
      weights.relevance * dims.relevance +
      weights.engagement * dims.engagement +
      weights.proximity * dims.proximity +
      weights.freshness * dims.freshness +
      weights.personalization * dims.personalization +
      weights.business_boost * dims.businessBoost
  }

  if (intentMode === 'PROBLEM') {
    score += (item.is_open_now ? 1 : 0) * 0.2
    score += clamp01(item.quality_score ?? 0) * 0.15
  }

  return clamp01(score)
}

// ─── Final score & ranking ────────────────────────────────────────────────────

export function computeFinalScore(
  item: RankingItem,
  context: RankingContext
): ScoredItem {
  const dims = computeDimensionScores(item, context)

  const intent_breakdown = {} as Record<IntentMode, number>
  for (const mode of INTENT_MODES) {
    intent_breakdown[mode] = computeIntentScoreWithDimensions(
      item,
      mode,
      dims
    )
  }

  const base = INTENT_MODES.reduce(
    (sum, mode) => sum + context.intent_probs[mode] * intent_breakdown[mode],
    0
  )

  const epsilon = context.epsilon ?? EPSILON
  const final_score = clamp01(base * (1 - epsilon) + Math.random() * epsilon)

  return {
    ...item,
    relevance_score: dims.relevance,
    engagement_score: dims.engagement,
    proximity_score: dims.proximity,
    freshness_score: dims.freshness,
    personalization_score: dims.personalization,
    business_boost_score: dims.businessBoost,
    final_score,
    intent_breakdown,
  }
}

export function rankItems(
  items: RankingItem[],
  context: RankingContext
): ScoredItem[] {
  return items
    .map((item) => computeFinalScore(item, context))
    .sort((a, b) => b.final_score - a.final_score)
}
