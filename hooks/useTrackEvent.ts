'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BehavioralEvent, ItemType } from '@/lib/ranking/types'

const SESSION_STORAGE_KEY = 'ro2ya_ranking_session_id'
const BATCH_INTERVAL_MS = 2000
const TRACK_ENDPOINT = '/api/events/track'

type ClientEvent = Omit<BehavioralEvent, 'user_id'>

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session'
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }
  return sessionId
}

function resolveUserId(userId: string | null): string {
  return userId ?? 'anonymous'
}

export function useTrackEvent() {
  const bufferRef = useRef<ClientEvent[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFlushingRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  const flushBuffer = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }

    if (isFlushingRef.current || bufferRef.current.length === 0) return

    const batch = bufferRef.current.splice(0)
    isFlushingRef.current = true

    const payload = {
      events: batch.map((event) => ({
        ...event,
        user_id: resolveUserId(userIdRef.current),
        session_id: event.session_id || getOrCreateSessionId(),
      })),
    }

    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .catch(() => {
        // Silent failure — re-queue at front for next flush attempt
        bufferRef.current.unshift(...batch)
      })
      .finally(() => {
        isFlushingRef.current = false
        if (bufferRef.current.length > 0) {
          flushTimerRef.current = setTimeout(() => {
            flushTimerRef.current = null
            flushBuffer()
          }, BATCH_INTERVAL_MS)
        }
      })
  }, [])

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) return
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null
      flushBuffer()
    }, BATCH_INTERVAL_MS)
  }, [flushBuffer])

  const enqueue = useCallback(
    (event: ClientEvent) => {
      bufferRef.current.push({
        ...event,
        session_id: event.session_id || getOrCreateSessionId(),
      })
      scheduleFlush()
    },
    [scheduleFlush]
  )

  useEffect(() => {
    const supabase = createClient()

    const syncUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        userIdRef.current = data.session?.user?.id ?? null
      } catch {
        userIdRef.current = null
      }
    }

    void syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      userIdRef.current = session?.user?.id ?? null
    })

    const onPageHide = () => flushBuffer()
    window.addEventListener('pagehide', onPageHide)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('pagehide', onPageHide)
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      flushBuffer()
    }
  }, [flushBuffer])

  const track = useCallback(
    async (event: ClientEvent): Promise<void> => {
      enqueue(event)
    },
    [enqueue]
  )

  const trackView = useCallback(
    (itemId: string, itemType: ItemType, category?: string) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'view',
        item_id: itemId,
        item_type: itemType,
        category,
      })
    },
    [enqueue]
  )

  const trackClick = useCallback(
    (itemId: string, itemType: ItemType, category?: string) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'click',
        item_id: itemId,
        item_type: itemType,
        category,
      })
    },
    [enqueue]
  )

  const trackSearch = useCallback(
    (queryLength: number, category?: string) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'search',
        query_length: queryLength,
        category,
      })
    },
    [enqueue]
  )

  const trackScroll = useCallback(
    (speed: number) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'scroll',
        scroll_speed: speed,
      })
    },
    [enqueue]
  )

  const trackContact = useCallback(
    (itemId: string, itemType: ItemType) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'contact',
        item_id: itemId,
        item_type: itemType,
      })
    },
    [enqueue]
  )

  const trackSave = useCallback(
    (itemId: string, itemType: ItemType) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'save',
        item_id: itemId,
        item_type: itemType,
      })
    },
    [enqueue]
  )

  const trackLike = useCallback(
    (itemId: string, itemType: ItemType) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'like',
        item_id: itemId,
        item_type: itemType,
      })
    },
    [enqueue]
  )

  const trackWatch = useCallback(
    (itemId: string, watchTime: number) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'watch',
        item_id: itemId,
        watch_time: watchTime,
      })
    },
    [enqueue]
  )

  const trackDiscountClick = useCallback(
    (itemId: string, price: number) => {
      void enqueue({
        session_id: getOrCreateSessionId(),
        event_type: 'discount_click',
        item_id: itemId,
        price,
        has_discount: true,
      })
    },
    [enqueue]
  )

  return {
    track,
    trackView,
    trackClick,
    trackSearch,
    trackScroll,
    trackContact,
    trackSave,
    trackLike,
    trackWatch,
    trackDiscountClick,
  }
}
