/**
 * RATE LIMITING
 *
 * Strategy: Upstash Redis si configuré (recommandé en production),
 * sinon fallback sur un Map en mémoire (ok pour dev / single instance).
 *
 * Pour activer Upstash (gratuit) :
 *   1. Créer un compte sur https://upstash.com
 *   2. Créer une DB Redis → copier les deux variables
 *   3. Ajouter dans .env.local :
 *        UPSTASH_REDIS_REST_URL=https://...upstash.io
 *        UPSTASH_REDIS_REST_TOKEN=AX...
 *   4. npm install @upstash/redis @upstash/ratelimit
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean       // true = allowed, false = blocked
  limit: number          // max requests allowed in the window
  remaining: number      // requests left in current window
  resetAt: number        // timestamp (ms) when the window resets
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMIT CONFIGS
// Adjust these values to match your security requirements.
// ─────────────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  // Login attempts: 5 per 15 minutes per IP
  login: { requests: 5, windowMs: 15 * 60 * 1000 },

  // Magic link requests: 3 per 10 minutes per IP (email sending is expensive)
  magicLink: { requests: 3, windowMs: 10 * 60 * 1000 },

  // Signup: 3 per hour per IP
  signup: { requests: 3, windowMs: 60 * 60 * 1000 },

  // General API: 60 per minute per IP
  api: { requests: 60, windowMs: 60 * 1000 },
} as const

export type RateLimitKey = keyof typeof RATE_LIMITS

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY FALLBACK (single-instance, dev/staging only)
// ─────────────────────────────────────────────────────────────────────────────

interface MemoryEntry {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) memoryStore.delete(key)
    }
  }, 5 * 60 * 1000)
}

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    // First request in this window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, limit, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPSTASH REDIS (production — multi-instance safe)
// ─────────────────────────────────────────────────────────────────────────────

async function checkUpstashRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!
  const windowSec = Math.floor(windowMs / 1000)
  const resetAt = Date.now() + windowMs

  try {
    // INCR + EXPIRE in a single pipeline for atomicity
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSec, 'NX'], // NX = only set if not exists
      ]),
    })

    if (!res.ok) throw new Error(`Upstash error: ${res.status}`)

    const data = await res.json()
    const count: number = data[0].result

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt,
    }
  } catch (err) {
    // If Redis is down, fail open (allow the request) and log
    console.error('[rate-limit] Upstash error, failing open:', err)
    return { success: true, limit, remaining: limit, resetAt }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Check rate limit for a given action and identifier (usually IP).
 *
 * @example
 * const result = await rateLimit('login', ip)
 * if (!result.success) return { error: 'Too many attempts. Try again later.' }
 */
export async function rateLimit(
  action: RateLimitKey,
  identifier: string
): Promise<RateLimitResult> {
  const { requests, windowMs } = RATE_LIMITS[action]
  const key = `rl:${action}:${identifier}`

  if (hasUpstash) {
    return checkUpstashRateLimit(key, requests, windowMs)
  }

  return checkMemoryRateLimit(key, requests, windowMs)
}

/**
 * Get the client IP from a Next.js request.
 * Handles Vercel, Cloudflare, Nginx proxy headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers as Headers

  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip') || // Cloudflare
    '127.0.0.1'
  )
}

/**
 * Format seconds into a human-readable string for error messages.
 */
export function formatRetryAfter(resetAt: number): string {
  const seconds = Math.ceil((resetAt - Date.now()) / 1000)
  if (seconds < 60) return `${seconds} seconds`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}