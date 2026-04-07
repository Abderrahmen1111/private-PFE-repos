'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { type DiscoverFeedItem } from '@/components/discover/feed-algorithm'
import { FeedActions } from '@/components/discover/feed-actions'
import { toast } from 'sonner'
import { useSavesStore } from '@/lib/store/use-saves-store'

type DiscoverCardProps = {
  item: DiscoverFeedItem & { merchantScore?: number }
  priority?: boolean
}

function DiscoverCardComponent({ item, priority = false }: DiscoverCardProps) {
  const [entered, setEntered] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showLikeBurst, setShowLikeBurst] = useState(false)
  const [isDimmed, setIsDimmed] = useState(false)
  const lastTapTsRef = useRef<number>(0)

  const saveCount = useSavesStore((state) => state.saveCount)
  const incrementSave = useSavesStore((state) => state.incrementSave)

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 50)
    return () => window.clearTimeout(id)
  }, [])

  const displayLikes = useMemo(() => item.likes + (liked ? 1 : 0), [item.likes, liked])

  const triggerLike = useCallback(() => {
    if (liked) return
    setLiked(true)
    setShowLikeBurst(true)
    setIsDimmed(true)
    setTimeout(() => setIsDimmed(false), 200)
  }, [liked])

  const handleToggleLike = useCallback(() => {
    if (liked) {
      setLiked(false)
    } else {
      triggerLike()
    }
  }, [liked, triggerLike])

  useEffect(() => {
    if (!showLikeBurst) return
    const id = window.setTimeout(() => setShowLikeBurst(false), 750)
    return () => window.clearTimeout(id)
  }, [showLikeBurst])

  const onMediaTouchEnd = useCallback(() => {
    const now = Date.now()
    const delta = now - lastTapTsRef.current
    lastTapTsRef.current = now
    if (delta > 0 && delta < 300) triggerLike()
  }, [triggerLike])

  const isTopSeller = (item.merchantScore ?? 0) >= 80

  const handleToggleSave = useCallback(() => {
    const isSavedNow = !saved
    setSaved(isSavedNow)
    if (isSavedNow) {
      toast('Ajouté ✓', {
        position: 'top-right',
        duration: 1500,
        action: {
          label: 'Annuler',
          onClick: () => setSaved(false),
        },
      })
      incrementSave()
    }
  }, [saved, incrementSave])

  return (
    <article
      className="relative h-screen w-full snap-start snap-always overflow-hidden bg-black"
      onDoubleClick={triggerLike}
      onTouchEnd={onMediaTouchEnd}
    >
      <div 
        className={cn(
          "absolute inset-0 z-40 pointer-events-none transition-colors duration-200", 
          isDimmed ? "bg-black/30" : "bg-transparent"
        )} 
      />

      {item.mediaType === 'video' ? (
        <video
          src={item.image}
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            entered ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-85',
          )}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img
          src={item.image}
          alt={`${item.product} by ${item.merchantName}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            entered ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-85',
          )}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]/30" />

      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          entered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        {item.isSponsored ? (
          <div className="pointer-events-none absolute left-4 top-6 z-20 rounded-full border border-[#F97316]/50 bg-[#F97316]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#F97316] shadow-[0_0_24px_rgba(249,115,22,0.35)]">
            Sponsored
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          <div
            className={cn(
              'pointer-events-auto w-full max-w-[74%] rounded-2xl border bg-[#1A1A1A]/70 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-500',
              item.isSponsored
                ? 'border-[#F97316]/45 ring-1 ring-[#F97316]/35'
                : 'border-[#2A2A2A]',
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {item.merchantName}
              </p>
              {isTopSeller ? (
                <span className="rounded-full bg-[#22C55E]/20 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                  Top Seller
                </span>
              ) : null}
            </div>

            <h2 className="text-2xl font-bold leading-tight text-white">🛍️ {item.product}</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/85">{item.description}</p>

            <div className="mt-3 flex items-center gap-3 text-white/85">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                <span>{item.merchant.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs uppercase text-white/70">{item.category}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 relative">
              <span className="text-lg font-semibold text-white">{item.price}</span>
              <button
                type="button"
                aria-label="Buy"
                className="rounded-full bg-[#22C55E] border border-[#22C55E] px-6 py-2 text-sm font-semibold text-[#0A0A0A] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] hover:bg-[#16A34A] hover:border-[#16A34A]"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
          showLikeBurst ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
        )}
      >
        <div className="rounded-full bg-rose-500/20 p-6 ring-1 ring-rose-300/30 backdrop-blur-sm">
          <span className="text-rose-200 text-6xl font-black leading-none">♥</span>
        </div>
      </div>

      <FeedActions
        likes={displayLikes}
        comments={item.comments}
        liked={liked}
        onToggleLike={handleToggleLike}
        saved={saved}
        onToggleSave={handleToggleSave}
      />
    </article>
  )
}

export const DiscoverCard = memo(DiscoverCardComponent)
