'use client'

import { DiscoverCard } from '@/components/discover/discover-card'
import { useInfiniteFeed } from '@/components/discover/useInfiniteFeed'

export function DiscoverFeed() {
  const { items, isLoading, hasMore, containerRef, sentinelRef } = useInfiniteFeed()

  return (
    <section
      aria-label="Discover feed"
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black"
      ref={containerRef}
    >
      {items.map((item, index) => (
        <DiscoverCard key={`${item.id}-${index}`} item={item} priority={index < 2} />
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

      {hasMore ? <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" /> : null}
    </section>
  )
}
