import { Redis } from '@upstash/redis'
import type { IntentProbabilities } from './types'

const INTENT_CACHE_TTL_SEC = 1800

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

export function intentCacheKey(userId: string, sessionId: string): string {
  return `intent:${userId}:${sessionId}`
}

export async function getCachedIntentProbs(
  userId: string,
  sessionId: string
): Promise<IntentProbabilities | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const raw = await redis.get<string>(intentCacheKey(userId, sessionId))
    if (!raw) return null

    const parsed =
      typeof raw === 'string' ? (JSON.parse(raw) as IntentProbabilities) : raw

    return parsed as IntentProbabilities
  } catch (error) {
    console.error('[ranking/intent-cache] get:', error)
    return null
  }
}

export async function setCachedIntentProbs(
  userId: string,
  sessionId: string,
  probs: IntentProbabilities
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.set(intentCacheKey(userId, sessionId), JSON.stringify(probs), {
      ex: INTENT_CACHE_TTL_SEC,
    })
  } catch (error) {
    console.error('[ranking/intent-cache] set:', error)
  }
}
