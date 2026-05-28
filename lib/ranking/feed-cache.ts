import { Redis } from '@upstash/redis'
import type { IntentMode, IntentProbabilities, ScoredItem } from './types'

const FEED_CACHE_TTL_SEC = 120

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  if (!redisClient) {
    redisClient = new Redis({ url, token })
  }

  return redisClient
}

export interface CachedFeedPayload {
  items: ScoredItem[]
  intent: IntentProbabilities
  dominant_intent: IntentMode
  has_more: boolean
}

export function feedCacheKey(
  userId: string,
  sessionId: string,
  offset: number
): string {
  return `feed:${userId}:${sessionId}:${offset}`
}

export async function getCachedFeed(
  userId: string,
  sessionId: string,
  offset: number
): Promise<CachedFeedPayload | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const raw = await redis.get<string>(feedCacheKey(userId, sessionId, offset))
    if (!raw) return null

    const parsed =
      typeof raw === 'string'
        ? (JSON.parse(raw) as CachedFeedPayload)
        : (raw as CachedFeedPayload)

    return parsed
  } catch (error) {
    console.error('[ranking/feed-cache] get:', error)
    return null
  }
}

export async function setCachedFeed(
  userId: string,
  sessionId: string,
  offset: number,
  payload: CachedFeedPayload
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.set(
      feedCacheKey(userId, sessionId, offset),
      JSON.stringify(payload),
      { ex: FEED_CACHE_TTL_SEC }
    )
  } catch (error) {
    console.error('[ranking/feed-cache] set:', error)
  }
}
