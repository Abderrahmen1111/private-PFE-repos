'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  type DiscoverFeedItem,
  fetchDiscoverPageCombined,
  calculateMerchantScore,
  MAX_PAGES,
  userPreferencesDefault
} from '@/components/discover/feed-algorithm'

import { getPersonalizedReels } from '@/lib/actions/recommendations'

export function useInfiniteFeed() {
  const [items, setItems] = useState<DiscoverFeedItem[]>([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const containerRef = useRef<HTMLElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const nextPage = page + 1;
      
      // Use the shared combined fetcher
      const merged = await fetchDiscoverPageCombined(
        page, 
        getPersonalizedReels, 
        userPreferencesDefault
      );

      setItems((prev) => [...prev, ...merged]);
      setPage(nextPage);
      if (nextPage >= MAX_PAGES) setHasMore(false);
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isLoading, page])

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  useEffect(() => {
    const root = containerRef.current
    const target = sentinelRef.current
    if (!root || !target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) void loadMore()
      },
      {
        root,
        rootMargin: '0px 0px 80% 0px',
        threshold: 0.01,
      },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  const rankedSnapshot = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        merchantScore: calculateMerchantScore(item.merchant),
      })),
    [items],
  )

  return {
    items: rankedSnapshot,
    isLoading,
    hasMore,
    containerRef,
    sentinelRef,
  }
}
