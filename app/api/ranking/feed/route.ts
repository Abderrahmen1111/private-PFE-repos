import { NextRequest, NextResponse } from 'next/server'
import { getCachedFeed, setCachedFeed } from '@/lib/ranking/feed-cache'
import { generateRankedFeed } from '@/lib/ranking/feed'
import { getDominantIntent } from '@/lib/ranking/intent'
import { createClient } from '@/lib/supabase/server'
import type { ItemType } from '@/lib/ranking/types'

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

function parseLimit(value: string | null): number {
  const n = Number(value ?? DEFAULT_LIMIT)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_LIMIT)
}

function parseOffset(searchParams: URLSearchParams): number {
  const raw = searchParams.get('offset') ?? searchParams.get('cursor') ?? '0'
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

function parseTypes(value: string | null): ItemType[] | undefined {
  if (!value) return undefined
  const allowed: ItemType[] = ['business', 'product', 'service', 'reel']
  const parsed = value
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t): t is ItemType => allowed.includes(t as ItemType))
  return parsed.length > 0 ? parsed : undefined
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')?.trim()
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const limit = parseLimit(searchParams.get('limit'))
    const offset = parseOffset(searchParams)
    const query = searchParams.get('query')?.trim() || undefined
    const lat = Number(searchParams.get('lat'))
    const lng = Number(searchParams.get('lng'))
    const types = parseTypes(searchParams.get('types'))

    const location =
      Number.isFinite(lat) && Number.isFinite(lng)
        ? { lat, lng }
        : undefined

    const cached = await getCachedFeed(user.id, sessionId, offset)
    if (cached) {
      return NextResponse.json(cached)
    }

    const { items, intent_probs } = await generateRankedFeed(user.id, sessionId, {
      query,
      location,
      limit,
      offset,
      types,
    })

    const payload = {
      items,
      intent: intent_probs,
      dominant_intent: getDominantIntent(intent_probs),
      has_more: items.length === limit,
    }

    void setCachedFeed(user.id, sessionId, offset, payload)

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[api/ranking/feed] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to generate ranked feed' },
      { status: 500 }
    )
  }
}
