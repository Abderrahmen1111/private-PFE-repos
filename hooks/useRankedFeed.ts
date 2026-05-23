'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { coldStartIntentDefaults } from '@/lib/ranking/intent'
import type {
  IntentMode,
  IntentProbabilities,
  ItemType,
  ScoredItem,
} from '@/lib/ranking/types'
import { setFeedPagination, useRankingStore } from '@/store/rankingStore'

const INTENT_DELTA_THRESHOLD = 0.3
const DEFAULT_PAGE_SIZE = 20

const INTENT_MODES: IntentMode[] = [
  'SEARCH',
  'DISCOVERY',
  'PROBLEM',
  'PASSIVE',
  'DEAL',
  'REENGAGEMENT',
  'TRANSACTION',
]

interface FeedApiResponse {
  items: ScoredItem[]
  intent?: IntentProbabilities
  intent_probs?: IntentProbabilities
  dominant_intent: IntentMode
  has_more?: boolean
  hasMore?: boolean
  nextCursor?: string | null
  error?: string
}

export interface UseRankedFeedOptions {
  query?: string
  location?: { lat: number; lng: number }
  types?: ItemType[]
  pageSize?: number
}

function buildCacheKey(options: UseRankedFeedOptions): string {
  return JSON.stringify({
    query: options.query ?? '',
    lat: options.location?.lat ?? null,
    lng: options.location?.lng ?? null,
    types: [...(options.types ?? [])].sort().join(','),
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
  })
}

function hasSignificantIntentChange(
  previous: IntentProbabilities | null | undefined,
  next: IntentProbabilities
): boolean {
  if (!previous) return false

  for (const mode of INTENT_MODES) {
    if (Math.abs(next[mode] - previous[mode]) > INTENT_DELTA_THRESHOLD) {
      return true
    }
  }

  return false
}

export function useRankedFeed(options: UseRankedFeedOptions = {}) {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const cacheKey = useMemo(() => buildCacheKey(options), [options])

  const feedItems = useRankingStore((state) => state.feedItems)
  const hasMore = useRankingStore((state) => state.hasMore)
  const intentState = useRankingStore((state) => state.intentProbs)
  const dominantIntent = useRankingStore((state) => state.dominantIntent)
  const setFeedItems = useRankingStore((state) => state.setFeedItems)
  const appendFeedItems = useRankingStore((state) => state.appendFeedItems)
  const updateIntentProbs = useRankingStore((state) => state.updateIntentProbs)
  const resetFeed = useRankingStore((state) => state.resetFeed)
  const initSession = useRankingStore((state) => state.initSession)

  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(feedItems.length === 0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)
  const intentRef = useRef<IntentProbabilities>(intentState)
  const lastCacheKeyRef = useRef(cacheKey)

  const fetchPage = useCallback(
    async (cursor: number, append: boolean) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const requestId = ++requestIdRef.current
      const previousIntent = intentRef.current

      const existingItems = useRankingStore.getState().feedItems.length

      if (append) {
        setIsFetchingMore(true)
      } else if (existingItems === 0) {
        setIsLoading(true)
      }

      setError(null)

      try {
        let activeSessionId = useRankingStore.getState().sessionId
        if (!activeSessionId) {
          initSession()
          activeSessionId = useRankingStore.getState().sessionId
        }

        const params = new URLSearchParams({
          sessionId: activeSessionId,
          limit: String(pageSize),
          offset: String(cursor),
        })

        if (options.query) params.set('query', options.query)
        if (options.location) {
          params.set('lat', String(options.location.lat))
          params.set('lng', String(options.location.lng))
        }
        if (options.types?.length) {
          params.set('types', options.types.join(','))
        }

        const res = await fetch(`/api/ranking/feed?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'include',
        })

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error ?? `Feed request failed (${res.status})`)
        }

        const data = (await res.json()) as FeedApiResponse

        if (requestId !== requestIdRef.current) return

        const intentProbs = data.intent ?? data.intent_probs ?? previousIntent
        const hasMorePage = data.has_more ?? data.hasMore ?? false

        const intentChanged = hasSignificantIntentChange(
          previousIntent,
          intentProbs
        )

        intentRef.current = intentProbs
        updateIntentProbs(intentProbs)

        const nextCursor = data.nextCursor
          ? Number(data.nextCursor)
          : cursor + data.items.length

        if (append && intentChanged) {
          setIsFetchingMore(false)
          void fetchPage(0, false)
          return
        }

        if (append) {
          appendFeedItems(data.items)
        } else {
          setFeedItems(data.items)
        }

        setFeedPagination(nextCursor, hasMorePage)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        if (requestId !== requestIdRef.current) return
        setError(err instanceof Error ? err : new Error('Failed to load feed'))
      } finally {
        if (requestId !== requestIdRef.current) return
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    },
    [
      appendFeedItems,
      initSession,
      options.location,
      options.query,
      options.types,
      pageSize,
      setFeedItems,
      updateIntentProbs,
    ]
  )

  const refresh = useCallback(() => {
    void fetchPage(0, false)
  }, [fetchPage])

  const fetchMore = useCallback(() => {
    const state = useRankingStore.getState()
    if (!state.hasMore || isFetchingMore || isLoading) return
    void fetchPage(state.feedCursor, true)
  }, [fetchPage, isFetchingMore, isLoading])

  useEffect(() => {
    initSession()
    intentRef.current = useRankingStore.getState().intentProbs
  }, [initSession])

  useEffect(() => {
    intentRef.current = intentState
  }, [intentState])

  useEffect(() => {
    if (lastCacheKeyRef.current !== cacheKey) {
      lastCacheKeyRef.current = cacheKey
      resetFeed()
    }

    void fetchPage(0, false)

    return () => {
      abortRef.current?.abort()
    }
  }, [cacheKey, fetchPage, resetFeed])

  return {
    items: feedItems,
    isLoading: isLoading && feedItems.length === 0,
    isFetchingMore,
    error,
    hasMore,
    intentState,
    dominantIntent,
    fetchMore,
    refresh,
  }
}
