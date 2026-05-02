'use client'

import { DiscoverCard } from '@/components/discover/discover-card'
import { useInfiniteFeed } from '@/components/discover/useInfiniteFeed'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DiscoverStoriesRow } from '@/components/discover/DiscoverStoriesRow'
import { cn } from '@/lib/utils'

export function DiscoverFeed({ isCompact = false }: { isCompact?: boolean }) {
  const router = useRouter()
  const { items, isLoading, hasMore, containerRef, sentinelRef } = useInfiniteFeed()

  return (
    <section
      aria-label="Discover feed"
      className={cn(
        "relative overflow-y-auto snap-y snap-mandatory scroll-smooth bg-black",
        isCompact ? "h-full w-full" : "h-screen"
      )}
      ref={containerRef}
    >
      {/* Stories at the top */}
      {!isCompact && (
        <div className="fixed top-0 inset-x-0 z-[55] pt-2">
          <DiscoverStoriesRow />
        </div>
      )}

      {/* Close button - only show if NOT compact */}
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
