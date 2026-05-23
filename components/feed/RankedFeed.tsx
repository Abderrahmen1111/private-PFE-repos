'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRankedFeed } from '@/hooks/useRankedFeed'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { FeedCard } from './FeedCard'
import { FeedSkeleton } from './FeedSkeleton'
import type { ScoredItem, ItemType, IntentMode } from '@/lib/ranking/types'
import { useRouter } from 'next/navigation'

// ── Intent badge colors ──────────────────────────────────────────────────────
const INTENT_CONFIG: Record<IntentMode, { label: string; color: string; emoji: string }> = {
  SEARCH:       { label: 'Recherche',    color: 'bg-blue-100 text-blue-700',    emoji: '🔍' },
  DISCOVERY:    { label: 'Découverte',   color: 'bg-purple-100 text-purple-700', emoji: '✨' },
  PROBLEM:      { label: 'Besoin urgent',color: 'bg-red-100 text-red-700',      emoji: '⚡' },
  PASSIVE:      { label: 'Exploration',  color: 'bg-gray-100 text-gray-600',    emoji: '🌊' },
  DEAL:         { label: 'Bonnes affaires',color:'bg-green-100 text-green-700', emoji: '💰' },
  REENGAGEMENT: { label: 'Retour',       color: 'bg-amber-100 text-amber-700',  emoji: '🔄' },
  TRANSACTION:  { label: 'Prêt à agir', color: 'bg-emerald-100 text-emerald-700',emoji:'🛒'},
}

// ── Props ────────────────────────────────────────────────────────────────────
interface RankedFeedProps {
  query?:          string
  location?:       { lat: number; lng: number }
  types?:          ItemType[]
  pageSize?:       number
  showIntentDebug?: boolean
  onItemClick?:    (item: ScoredItem) => void
  emptyMessage?:   string
  className?:      string
}

// ── Component ────────────────────────────────────────────────────────────────
export function RankedFeed({
  query,
  location,
  types,
  pageSize        = 12,
  showIntentDebug = false,
  onItemClick,
  emptyMessage    = 'Aucun contenu disponible pour le moment.',
  className       = '',
}: RankedFeedProps) {
  const router  = useRouter()
  const { trackView } = useTrackEvent()

  // ── Feed data ──────────────────────────────────────────────────────────────
  const {
    items,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    dominantIntent,
    intentState,
    fetchMore,
    refresh,
  } = useRankedFeed({ query, location, types, pageSize })

  // ── Infinite scroll — sentinel observer ───────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          fetchMore()
        }
      },
      { rootMargin: '200px' }  // start loading 200px before bottom
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, fetchMore])

  // ── Viewport tracking — track 'view' for visible cards ───────────────────
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const trackedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-item-id')
          if (!id) return

          if (entry.isIntersecting && !trackedIds.current.has(id)) {
            trackedIds.current.add(id)

            // Find item to get type
            const item = items.find((i) => i.id === id)
            if (item) {
              trackView(item.id, item.type, item.category)
            }
          }
        })
      },
      { threshold: 0.5 }  // 50% visible = counted as viewed
    )

    // Observe all card elements
    cardRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items, trackView])

  // Register card ref callback
  const registerCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(id, el)
      } else {
        cardRefs.current.delete(id)
      }
    },
    []
  )

  // ── Item click handler ─────────────────────────────────────────────────────
  const handleItemClick = useCallback(
    (item: ScoredItem) => {
      if (onItemClick) {
        onItemClick(item)
        return
      }

      // Default navigation by type
      switch (item.type) {
        case 'business':
          router.push(`/business/${item.id}`)
          break
        case 'product':
        case 'service':
          router.push(`/item/${item.id}`)
          break
        case 'reel':
          router.push(`/discover?reel=${item.id}`)
          break
      }
    },
    [onItemClick, router]
  )

  // ── Intent config ──────────────────────────────────────────────────────────
  const intentCfg = INTENT_CONFIG[dominantIntent]

  // ── Render states ──────────────────────────────────────────────────────────

  // Initial loading
  if (isLoading && items.length === 0) {
    return (
      <div className={className}>
        <FeedSkeleton count={pageSize} />
      </div>
    )
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <span className="text-4xl">⚠️</span>
        <p className="mt-3 text-sm text-gray-500">
          Impossible de charger le feed.
        </p>
        <button
          onClick={refresh}
          className="
            mt-4 rounded-full bg-gray-900 px-5 py-2
            text-sm font-medium text-white
            transition hover:bg-gray-700 active:scale-95
          "
        >
          Réessayer
        </button>
      </div>
    )
  }

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <span className="text-5xl">🔍</span>
        <p className="mt-4 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
        <button
          onClick={refresh}
          className="
            mt-4 rounded-full bg-gray-900 px-5 py-2
            text-sm font-medium text-white
            transition hover:bg-gray-700 active:scale-95
          "
        >
          Actualiser
        </button>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col ${className}`}>

      {/* ── Intent Debug Badge (dev only) ── */}
      {showIntentDebug && (
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">

          {/* Dominant intent */}
          <span className={`
            inline-flex items-center gap-1.5 rounded-full
            px-3 py-1 text-xs font-semibold
            ${intentCfg.color}
          `}>
            {intentCfg.emoji} {intentCfg.label}
          </span>

          {/* Intent probability bars */}
          <div className="flex gap-1">
            {(Object.entries(intentState) as [IntentMode, number][])
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([mode, prob]) => (
                <span
                  key={mode}
                  className="
                    rounded-full bg-gray-100 px-2 py-0.5
                    text-[10px] text-gray-500
                  "
                >
                  {mode.slice(0, 4)} {Math.round(prob * 100)}%
                </span>
              ))
            }
          </div>

        </div>
      )}

      {/* ── Stale data indicator (loading new results) ── */}
      {isLoading && items.length > 0 && (
        <div className="mb-2 flex items-center justify-center">
          <span className="
            inline-flex items-center gap-1.5 rounded-full
            bg-blue-50 px-3 py-1 text-xs text-blue-600
          ">
            <span className="
              h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500
            " />
            Mise à jour du feed...
          </span>
        </div>
      )}

      {/* ── Feed grid ── */}
      <div className="
        grid grid-cols-2 gap-3
        sm:grid-cols-3
        lg:grid-cols-4
      ">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            data-item-id={item.id}
            ref={registerCardRef(item.id)}
          >
            <FeedCard
              item={item}
              onCardClick={handleItemClick}
            />
          </div>
        ))}

        {/* ── Fetch more skeletons ── */}
        {isFetchingMore && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-more-${i}`}>
                <div className="
                  h-60 animate-pulse rounded-2xl
                  bg-gradient-to-br from-gray-200
                  via-gray-100 to-gray-200
                " />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Infinite scroll sentinel ── */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

      {/* ── End of feed message ── */}
      {!hasMore && items.length > 0 && (
        <div className="py-10 text-center">
          <p className="text-xs text-gray-400">
            Vous avez tout vu ! 🎉
          </p>
          <button
            onClick={refresh}
            className="
              mt-3 rounded-full border border-gray-200
              px-4 py-1.5 text-xs font-medium
              text-gray-600 transition
              hover:border-gray-400 hover:text-gray-900
              active:scale-95
            "
          >
            Rafraîchir le feed
          </button>
        </div>
      )}

    </div>
  )
}