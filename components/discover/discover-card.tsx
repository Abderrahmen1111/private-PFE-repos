'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { type DiscoverFeedItem } from '@/components/discover/feed-algorithm'
import { FeedActions } from '@/components/discover/feed-actions'
import { toast } from 'sonner'
import { useSavesStore } from '@/lib/store/use-saves-store'
import { trackReelInteraction } from '@/lib/actions/reels'
import { CommentDrawer } from '@/components/discover/comment-drawer'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

type DiscoverCardProps = {
  item: DiscoverFeedItem & { merchantScore?: number }
  priority?: boolean
}

function DiscoverCardComponent({ item, priority = false }: DiscoverCardProps) {
  const [entered, setEntered] = useState(false)
  const [liked, setLiked] = useState<boolean>(item.hasLiked || false)
  const [saved, setSaved] = useState<boolean>(item.hasSaved || false)
  const [showLikeBurst, setShowLikeBurst] = useState(false)
  const [isDimmed, setIsDimmed] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [isMediaLoading, setIsMediaLoading] = useState(true)
  const [mediaError, setMediaError] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const lastTapTsRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const saveCount = useSavesStore((state) => state.saveCount)
  const incrementSave = useSavesStore((state) => state.incrementSave)

  // Extract numeric ID for database calls (handles 'reel-123' or 'story-123' or 'p0-item...')
  const numericId = useMemo(() => {
    // If ID is just a number
    if (/^\d+$/.test(item.id)) return parseInt(item.id);
    // If ID is 'reel-123' or 'story-123'
    const match = item.id.match(/(\d+)$/);
    return match ? parseInt(match[1]) : null;
  }, [item.id]);

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 50)
    return () => window.clearTimeout(id)
  }, [])

  const displayLikes = useMemo(() => item.likes + (liked ? 1 : 0), [item.likes, liked])

  const triggerLike = useCallback(async () => {
    if (liked) return
    setLiked(true)
    setShowLikeBurst(true)
    setIsDimmed(true)
    setTimeout(() => setIsDimmed(false), 200)

    if (numericId) {
      trackReelInteraction(numericId, 'like');
    }
  }, [liked, numericId])

  const handleToggleLike = useCallback(async () => {
    if (liked) {
      setLiked(false)
      if (numericId) trackReelInteraction(numericId, 'like'); // This handles removal in my action
    } else {
      triggerLike()
    }
  }, [liked, triggerLike, numericId])

  useEffect(() => {
    if (!showLikeBurst) return
    const id = window.setTimeout(() => setShowLikeBurst(false), 750)
    return () => window.clearTimeout(id)
  }, [showLikeBurst])

  const onMediaTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now()
    const delta = now - lastTapTsRef.current
    lastTapTsRef.current = now

    // Double tap for Like
    if (delta > 0 && delta < 300) {
      triggerLike()
      return
    }

    // Single tap for Navigation (Split screen into left/right)
    if (item.allMedia && item.allMedia.length > 1) {
      const { clientX } = 'touches' in e ? e.touches[0] || (e as any).changedTouches[0] : e as any;
      const width = window.innerWidth;
      
      if (clientX < width / 3) {
        // Left 33% = Previous
        setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : item.allMedia!.length - 1))
      } else {
        // Right 66% = Next
        setCurrentMediaIndex((prev) => (prev < item.allMedia!.length - 1 ? prev + 1 : 0))
      }
    }
  }, [triggerLike, item.allMedia])

  // Auto-advance for images slideshow
  useEffect(() => {
    if (item.mediaType === 'video' || !item.allMedia || item.allMedia.length <= 1) return

    const timer = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev < item.allMedia!.length - 1 ? prev + 1 : 0))
    }, 3000)

    return () => clearInterval(timer)
  }, [item.mediaType, item.allMedia])

  // Reset index when item changes
  useEffect(() => {
    setCurrentMediaIndex(0)
  }, [item.id])

  const isTopSeller = (item.merchantScore ?? 0) >= 80

  const handleToggleSave = useCallback(async () => {
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

    if (numericId) {
      trackReelInteraction(numericId, 'save');
    }
  }, [saved, incrementSave, numericId])

  useEffect(() => {
    // Reset state if the item object completely changes (e.g., when swiping between real reels)
    setLiked(item.hasLiked || false);
    setSaved(item.hasSaved || false);
  }, [item.id, item.hasLiked, item.hasSaved]);

  const handleBuy = useCallback(() => {
    if (item.itemId) {
      const path = item.itemType === 'SERVICE' ? 'service' : 'product';
      router.push(`/merchants/${path}/${item.itemId}`);
    } else {
      // Fallback to merchant profile page if no specific item is linked
      router.push(`/merchants/business/${item.merchantId}`);
    }
  }, [item.itemId, item.itemType, item.merchantId, router])

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
        <div className="relative h-full w-full bg-black">
          {isMediaLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white/20" />
            </div>
          )}
          {mediaError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
              <AlertCircle className="mb-2 h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-white">Vidéo non supportée ou introuvable</p>
              <p className="mt-1 text-xs text-white/50">{item.image.split('/').pop()}</p>
            </div>
          )}
          {/* Blurred background layer */}
          <video
            src={item.image}
            className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-60 scale-110"
            autoPlay
            loop
            muted
            playsInline
          />
          <video
            ref={videoRef}
            src={item.image}
            className={cn(
              'relative z-10 h-full w-full object-contain transition-all duration-700',
              entered && !isMediaLoading ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
            )}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadStart={() => setIsMediaLoading(true)}
            onCanPlay={() => setIsMediaLoading(false)}
            onWaiting={() => setIsMediaLoading(true)}
            onPlaying={() => setIsMediaLoading(false)}
            onError={(e) => {
              console.error("Video Load Error:", item.image, e);
              setIsMediaLoading(false);
              setMediaError(true);
            }}
          />
        </div>
      ) : (
        <div className="relative h-full w-full bg-black">
          {isMediaLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white/20" />
            </div>
          )}
          {/* Blurred background layer */}
          <img
            src={item.allMedia?.[currentMediaIndex] || item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-60 scale-110"
          />
          <img
            src={item.allMedia?.[currentMediaIndex] || item.image}
            alt={`${item.product} by ${item.merchantName}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'relative z-10 h-full w-full object-contain transition-all duration-700',
              entered && !isMediaLoading ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
            )}
            onLoad={() => setIsMediaLoading(false)}
            onError={() => {
              setIsMediaLoading(false);
              setMediaError(true);
            }}
          />
        </div>
      )}

      {/* Progress indicators for slideshow */}
      {item.allMedia && item.allMedia.length > 1 && (
        <div className="absolute top-4 inset-x-4 z-50 flex gap-1.5 px-2">
          {item.allMedia.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm"
            >
              <div 
                className={cn(
                  "h-full bg-white transition-all duration-300",
                  idx < currentMediaIndex ? "w-full" : idx === currentMediaIndex ? "w-full opacity-100" : "w-0"
                )}
                style={idx === currentMediaIndex && item.mediaType !== 'video' ? {
                  transitionDuration: '3000ms',
                  transitionTimingFunction: 'linear'
                } : undefined}
              />
            </div>
          ))}
        </div>
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 sm:px-6 pb-20">
          <div
            className={cn(
              'pointer-events-auto w-full max-w-md rounded-2xl border bg-black/40 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-500',
              item.isSponsored
                ? 'border-[#F97316]/50 ring-1 ring-[#F97316]/40'
                : 'border-white/10 ring-1 ring-white/5',
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
                onClick={handleBuy}
              >
                {item.itemType === 'SERVICE' ? 'Réserver' : 'Acheter'}
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
        onOpenComments={() => setCommentsOpen(true)}
      />

      {numericId && (
        <CommentDrawer 
          isOpen={commentsOpen} 
          onClose={() => setCommentsOpen(false)} 
          reelId={numericId} 
        />
      )}
    </article>
  )
}

export const DiscoverCard = memo(DiscoverCardComponent)
