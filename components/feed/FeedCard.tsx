'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { Heart, MapPin, Star, Clock, Tag } from 'lucide-react'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import type { ScoredItem } from '@/lib/ranking/types'

interface FeedCardProps {
  item: ScoredItem
  onCardClick?: (item: ScoredItem) => void
}

// Dinar Tunisien formatter
const formatDT = (price: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' DT'

// Format view count compactly
const formatViews = (n: number) =>
  Intl.NumberFormat('fr', { notation: 'compact' }).format(n)

export function FeedCard({ item, onCardClick }: FeedCardProps) {
  const [isLiked, setIsLiked]   = useState(false)
  const [isSaved, setIsSaved]   = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)

  const { trackClick, trackLike, trackSave } = useTrackEvent()

  // ── Handlers ────────────────────────────────────────────────

  const handleCardClick = useCallback(() => {
    trackClick(item.id, item.type, item.category)
    onCardClick?.(item)
  }, [item, trackClick, onCardClick])

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsLiked((prev) => !prev)
      setLikeAnim(true)
      setTimeout(() => setLikeAnim(false), 400)
      trackLike(item.id, item.type)
    },
    [item.id, item.type, trackLike]
  )

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsSaved((prev) => !prev)
      trackSave(item.id, item.type)
    },
    [item.id, item.type, trackSave]
  )

  // ── Render helpers ───────────────────────────────────────────

  const renderBadge = () => {
    if (item.discount_pct && item.discount_pct > 0) {
      return (
        <span className="
          absolute left-2 top-2 z-10
          rounded-full bg-red-500 px-2 py-0.5
          text-[10px] font-bold text-white shadow
        ">
          -{item.discount_pct}%
        </span>
      )
    }
    if (item.type === 'reel') {
      return (
        <span className="
          absolute left-2 top-2 z-10
          rounded-full bg-black/60 px-2 py-0.5
          text-[10px] font-medium text-white
        ">
          {item.category?.toUpperCase() ?? 'REEL'}
        </span>
      )
    }
    return null
  }

  const renderOpenBadge = () => {
    if (item.type !== 'business') return null
    return (
      <span className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5
        text-[10px] font-medium
        ${item.is_open_now
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 text-gray-500'
        }
      `}>
        <span className={`
          h-1.5 w-1.5 rounded-full
          ${item.is_open_now ? 'bg-emerald-500' : 'bg-gray-400'}
        `} />
        {item.is_open_now ? 'Ouvert' : 'Fermé'}
      </span>
    )
  }

  const renderPrice = () => {
    if (!item.price) return null
    return (
      <span className="text-sm font-bold text-gray-900">
        {formatDT(item.price)}
      </span>
    )
  }

  const renderRating = () => {
    if (!item.avg_rating) return null
    return (
      <span className="
        flex items-center gap-0.5
        text-[11px] text-gray-500
      ">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="font-medium text-gray-700">
          {item.avg_rating.toFixed(1)}
        </span>
        {item.review_count ? (
          <span>({item.review_count})</span>
        ) : null}
      </span>
    )
  }

  const renderMeta = () => {
    switch (item.type) {
      case 'business':
        return (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {renderOpenBadge()}
            {item.category && (
              <span className="
                flex items-center gap-0.5
                text-[10px] text-gray-400
              ">
                <Tag className="h-2.5 w-2.5" />
                {item.category}
              </span>
            )}
          </div>
        )

      case 'product':
        return (
          <div className="flex items-center justify-between pt-1">
            {renderPrice()}
            {renderRating()}
          </div>
        )

      case 'service':
        return (
          <div className="flex items-center justify-between pt-1">
            {renderPrice()}
            {item.category && (
              <span className="text-[10px] text-gray-400">
                {item.category}
              </span>
            )}
          </div>
        )

      case 'reel':
        return (
          <div className="flex items-center gap-1 pt-1">
            {item.merchant_name && (
              <span className="
                truncate text-[11px] text-gray-500
              ">
                {item.merchant_name}
              </span>
            )}
            {item.total_views !== undefined && (
              <span className="
                ml-auto shrink-0
                text-[10px] text-gray-400
              ">
                {formatViews(item.total_views)} vues
              </span>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // ── Render ───────────────────────────────────────────────────

  return (
    <article
      onClick={handleCardClick}
      className="
        group relative flex cursor-pointer flex-col
        overflow-hidden rounded-2xl border border-gray-100
        bg-white shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        active:scale-[0.98]
      "
    >
      {/* ── Image zone ── */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">

        {/* Discount / category badge */}
        {renderBadge()}

        {/* Promoted badge */}
        {item.is_promoted && (
          <span className="
            absolute right-2 top-2 z-10
            rounded-full bg-amber-400 px-2 py-0.5
            text-[10px] font-bold text-white shadow
          ">
            ⭐ Sponsorisé
          </span>
        )}

        {/* Item image */}
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="
              object-cover transition-transform
              duration-300 group-hover:scale-105
            "
          />
        ) : (
          <div className="
            flex h-full w-full items-center justify-center
            bg-gradient-to-br from-gray-100 to-gray-200
          ">
            <span className="text-3xl text-gray-300">
              {item.type === 'reel' ? '🎬'
               : item.type === 'business' ? '🏪'
               : item.type === 'service' ? '🔧'
               : '📦'}
            </span>
          </div>
        )}

        {/* Heart (Like) button */}
        <button
          onClick={handleLike}
          aria-label={isLiked ? 'Retirer le like' : 'Liker'}
          className="
            absolute bottom-2 right-2 z-10
            flex h-8 w-8 items-center justify-center
            rounded-full bg-white/90 shadow-sm
            backdrop-blur-sm transition-transform
            active:scale-90
          "
        >
          <Heart
            className={`
              h-4 w-4 transition-all duration-200
              ${likeAnim ? 'scale-125' : 'scale-100'}
              ${isLiked
                ? 'fill-red-500 text-red-500'
                : 'fill-transparent text-gray-400'
              }
            `}
          />
        </button>
      </div>

      {/* ── Content zone ── */}
      <div className="flex flex-1 flex-col gap-1 p-3">

        {/* Title */}
        <h3 className="
          line-clamp-2 text-[13px] font-semibold
          leading-snug text-gray-900
        ">
          {item.title}
        </h3>

        {/* Description (optional) */}
        {item.description && (
          <p className="
            line-clamp-1 text-[11px]
            leading-relaxed text-gray-400
          ">
            {item.description}
          </p>
        )}

        {/* Rating row (always visible if exists) */}
        <div className="flex items-center justify-between">
          {renderRating()}

          {/* Save bookmark */}
          <button
            onClick={handleSave}
            aria-label={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
            className="
              ml-auto flex h-6 w-6 items-center justify-center
              rounded-full transition-colors
              hover:bg-gray-100 active:scale-90
            "
          >
            <svg
              viewBox="0 0 24 24"
              className={`
                h-3.5 w-3.5 transition-colors
                ${isSaved
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-gray-300 stroke-current stroke-2'
                }
              `}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Type-specific meta */}
        {renderMeta()}
      </div>
    </article>
  )
}