import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { parseTrackEventsBody } from '@/lib/ranking/event-schema'
import { updateItemRankingStats } from '@/lib/ranking/feed'
import {
  getCachedIntentProbs,
  setCachedIntentProbs,
} from '@/lib/ranking/intent-cache'
import {
  coldStartIntentDefaults,
  getDominantIntent,
  updateIntentScores,
} from '@/lib/ranking/intent'
import type { BehavioralEvent, IntentProbabilities } from '@/lib/ranking/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

interface UserIntentStateRow {
  intent_probs?: IntentProbabilities | null
}

function getRankingDb() {
  return createAdminClient() as ReturnType<typeof createAdminClient> & {
    from: (table: string) => ReturnType<ReturnType<typeof createAdminClient>['from']>
  }
}

function toEventRow(event: BehavioralEvent) {
  return {
    user_id: event.user_id,
    session_id: event.session_id,
    event_type: event.event_type,
    item_id: event.item_id ?? null,
    item_type: event.item_type ?? null,
    category: event.category ?? null,
    scroll_speed: event.scroll_speed ?? null,
    watch_time: event.watch_time ?? null,
    distance_km: event.distance_km ?? null,
    has_discount: event.has_discount ?? null,
    query_length: event.query_length ?? null,
    price: event.price ?? null,
    metadata: event.metadata ?? {},
    created_at: new Date().toISOString(),
  }
}

async function fetchIntentFromDb(
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
    console.error('[api/events/track] fetch intent:', error.message)
    return null
  }

  return (data as UserIntentStateRow | null)?.intent_probs ?? null
}

async function upsertIntentState(
  userId: string,
  sessionId: string,
  intentProbs: IntentProbabilities
): Promise<void> {
  const supabase = getRankingDb()

  const { error } = await supabase.from('user_intent_state').upsert(
    {
      user_id: userId,
      session_id: sessionId,
      intent_probs: intentProbs,
      dominant_intent: getDominantIntent(intentProbs),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,session_id' }
  )

  if (error) {
    console.error('[api/events/track] upsert intent:', error.message)
  }
}

async function applyIntentUpdates(
  userId: string,
  sessionId: string,
  events: BehavioralEvent[]
): Promise<IntentProbabilities> {
  let probs =
    (await getCachedIntentProbs(userId, sessionId)) ??
    (await fetchIntentFromDb(userId, sessionId)) ??
    coldStartIntentDefaults()

  for (const event of events) {
    probs = updateIntentScores(probs, event.event_type)
  }

  await upsertIntentState(userId, sessionId, probs)
  await setCachedIntentProbs(userId, sessionId, probs)

  return probs
}

async function processEvents(events: BehavioralEvent[]): Promise<void> {
  const supabase = getRankingDb()

  const { error: insertError } = await supabase
    .from('events')
    .insert(events.map(toEventRow))

  if (insertError) {
    console.error('[api/events/track] insert events:', insertError.message)
    return
  }

  const sessionBuckets = new Map<
    string,
    { userId: string; sessionId: string; events: BehavioralEvent[] }
  >()

  for (const event of events) {
    const key = JSON.stringify([event.user_id, event.session_id])
    const bucket = sessionBuckets.get(key)
    if (bucket) {
      bucket.events.push(event)
    } else {
      sessionBuckets.set(key, {
        userId: event.user_id,
        sessionId: event.session_id,
        events: [event],
      })
    }
  }

  await Promise.all(
    Array.from(sessionBuckets.values()).map(({ userId, sessionId, events: sessionEvents }) =>
      applyIntentUpdates(userId, sessionId, sessionEvents)
    )
  )

  await Promise.all(
    events
      .filter((event) => event.item_id && event.item_type)
      .map((event) =>
        updateItemRankingStats(
          event.item_id!,
          event.item_type!,
          event.event_type
        )
      )
  )
}

export async function POST(req: NextRequest) {
  let events: BehavioralEvent[]

  try {
    const body = await req.json()
    events = parseTrackEventsBody(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid event payload', details: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const hasForeignUser = events.some(
        (event) => event.user_id !== user.id && event.user_id !== 'anonymous'
      )
      if (hasForeignUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  } catch {
    // Auth check is best-effort; anonymous tracking still allowed
  }

  void processEvents(events).catch((error) => {
    console.error('[api/events/track] background processing failed:', error)
  })

  return NextResponse.json(
    { ok: true, accepted: events.length },
    { status: 200 }
  )
}
