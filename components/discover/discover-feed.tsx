'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

import { DiscoverCard } from '@/components/discover/discover-card'
import { useInfiniteFeed } from '@/components/discover/useInfiniteFeed'
import { useVideoPrefetch } from '@/components/discover/useVideoPrefetch'
import { DiscoverStoriesRow } from '@/components/discover/DiscoverStoriesRow'
import { cn } from '@/lib/utils'

export function DiscoverFeed({ isCompact = false }: { isCompact?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reelId = searchParams.get('reelId')
  const { items, isLoading, hasMore, containerRef, sentinelRef } = useInfiniteFeed()

  /**
   * currentIndex — the feed card that is ≥60 % visible in the viewport.
   * Passed to the L1 prefetcher so it knows which items to warm next.
   */
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * A stable Map from card index → article DOM element.
   * Populated by the `onCardRef` callback each DiscoverCard exposes.
   */
  const cardRefsMap = useRef<Map<number, HTMLElement>>(new Map())

  /** Stable ref callback factory — memoised so we don't re-render on every card mount. */
  const makeCardRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) {
        cardRefsMap.current.set(index, el)
        // If this element matches our target reelId, scroll to it immediately!
        const item = items[index]
        if (item && reelId && (item.id === reelId || item.id === `reel-${reelId}`)) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'auto', block: 'start' })
          }, 50)
        }
      }
      else cardRefsMap.current.delete(index)
    },
    [reelId, items],
  )

  // ── L1 – Video / Image Prefetch ─────────────────────────────────────────
  // Warms the next 2 items in the browser cache before the user swipes to them.
  useVideoPrefetch(items, currentIndex)

  // ── Current-index tracking via IntersectionObserver ──────────────────────
  // Re-runs whenever the item list grows (new page loaded) so newly mounted
  // cards are observed immediately.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const raw = entry.target.getAttribute('data-card-index')
            if (raw !== null) setCurrentIndex(parseInt(raw, 10))
          }
        }
      },
      { root, threshold: 0.6 },
    )

    // Observe every card that has registered itself so far.
    cardRefsMap.current.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [items.length, containerRef]) // re-observe when the list grows

  return (
    <section
      aria-label="Discover feed"
      className={cn(
        'relative overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black',
        isCompact ? 'h-full w-full' : 'h-screen',
      )}
      ref={containerRef}
    >
      {/* Stories row — pinned at the top outside compact mode */}
      {!isCompact && (
        <div className="fixed top-0 inset-x-0 z-[55] pt-2">
          <DiscoverStoriesRow />
        </div>
      )}

      {/* Close button */}
      {!isCompact && (
        <button
          onClick={() => router.push('/')}
          className="fixed top-6 left-6 z-[60] size-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 hover:bg-white/20 shadow-2xl"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {items.map((item, index) => (
        <DiscoverCard
          key={`${item.id}-${index}`}
          item={item}
          priority={index < 2}
          cardIndex={index}
          onCardRef={makeCardRef(index)}
        />
      ))}

      {isLoading
        ? Array.from({ length: 2 }, (_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-screen snap-start bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6"
            >
              <div className="h-full w-full animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            </div>
          ))
        : null}

      {hasMore ? (
        <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" />
      ) : null}
    </section>
  )
}
