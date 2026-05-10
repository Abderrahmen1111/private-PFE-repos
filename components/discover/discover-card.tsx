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
import { useTracking } from '@/hooks/useTracking'

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

  const { trackLike, trackUnlike, trackSave, trackUnsave, trackClick, trackImpression } = useTracking()

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
    // Track impression when card becomes visible
    trackImpression('reels', item.id, 0, item.merchantId?.toString())
    return () => window.clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const displayLikes = useMemo(() => {
    const baseLikes = item.likes || 0;
    // Si l'état actuel (liked) est différent de l'état initial (item.hasLiked), on ajuste
    if (liked && !item.hasLiked) return baseLikes + 1;
    if (!liked && item.hasLiked) return baseLikes - 1;
    return baseLikes;
  }, [item.likes, item.hasLiked, liked]);

  const displaySaves = useMemo(() => {
    const baseSaves = item.saves || 0;
    if (saved && !item.hasSaved) return baseSaves + 1;
    if (!saved && item.hasSaved) return baseSaves - 1;
    return baseSaves;
  }, [item.saves, item.hasSaved, saved]);

  const triggerLike = useCallback(async () => {
    if (liked) return
    setLiked(true)
    setShowLikeBurst(true)
    setIsDimmed(true)
    setTimeout(() => setIsDimmed(false), 200)

    // Track like event → saved immediately to events table
    trackLike('reels', item.id, item.merchantId?.toString())

    if (numericId) {
      trackReelInteraction(numericId, 'like');
    }
  }, [liked, numericId, item.id, item.merchantId, trackLike])

  const handleToggleLike = useCallback(async () => {
    if (liked) {
      setLiked(false)
      // Track unlike event
      trackUnlike('reels', item.id, item.merchantId?.toString())
      if (numericId) trackReelInteraction(numericId, 'like');
    } else {
      triggerLike()
    }
  }, [liked, triggerLike, numericId, item.id, item.merchantId, trackUnlike])

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
      // Track save event
      trackSave('reels', item.id, item.merchantId?.toString())
    } else {
      // Track unsave event
      trackUnsave('reels', item.id, item.merchantId?.toString())
    }

    if (numericId) {
      trackReelInteraction(numericId, 'save');
    }
  }, [saved, incrementSave, numericId, item.id, item.merchantId, trackSave, trackUnsave])

  useEffect(() => {
    // Reset state if the item object completely changes (e.g., when swiping between real reels)
    setLiked(item.hasLiked || false);
    setSaved(item.hasSaved || false);
  }, [item.id, item.hasLiked, item.hasSaved]);

  const handleBuy = useCallback(() => {
    // Track buy/booking click as a high-priority click event
    trackClick('reels', item.id, 0, item.merchantId?.toString())

    if (item.itemId) {
      const path = item.itemType === 'SERVICE' ? 'service' : 'product';
      router.push(`/merchants/${path}/${item.itemId}`);
    } else {
      router.push(`/merchants/business/${item.merchantId}`);
    }
  }, [item.itemId, item.itemType, item.merchantId, item.id, router, trackClick])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: item.product,
      text: `Regardez ce reel sur Ro2ya : ${item.product}`,
      url: `${window.location.origin}/reels/${item.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        if (numericId) trackReelInteraction(numericId, 'share' as any)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Lien copié dans le presse-papier !')
        if (numericId) trackReelInteraction(numericId, 'share' as any)
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }, [item.product, item.id, numericId])

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
            autoPlay={false}

            loop
            
            playsInline
          />
          <video
            ref={videoRef}
            src={item.image}
            className={cn(
              'relative z-10 h-full w-full object-contain transition-all duration-700',
              entered && !isMediaLoading ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
            )}
            autoPlay={false}

            loop
            
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadStart={() => setIsMediaLoading(true)}
            onCanPlay={() => setIsMediaLoading(false)}
            onWaiting={() => setIsMediaLoading(true)}
            onPlaying={() => {
              setIsMediaLoading(false);
              // Trigger view count once per mount
              if (numericId && !(window as any)[`viewed_${item.id}`]) {
                trackReelInteraction(numericId, 'view');
                (window as any)[`viewed_${item.id}`] = true;
              }
            }}
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
            className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-30 scale-125 brightness-[0.25]"
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
            onLoad={() => {
              setIsMediaLoading(false);
              if (numericId && !(window as any)[`viewed_${item.id}`]) {
                trackReelInteraction(numericId, 'view');
                (window as any)[`viewed_${item.id}`] = true;
              }
            }}
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
              'pointer-events-auto w-[82%] max-w-[320px] rounded-3xl border bg-black/40 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-500',
              item.isSponsored
                ? 'border-[#F97316]/50 ring-1 ring-[#F97316]/40'
                : 'border-white/10 ring-1 ring-white/5',
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 items-center rounded-full bg-white/10 px-2.5 backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                  {item.merchantName}
                </p>
              </div>
              {isTopSeller ? (
                <span className="flex h-6 items-center rounded-full bg-[#22C55E]/20 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#22C55E] border border-[#22C55E]/20">
                  Top Seller
                </span>
              ) : null}
            </div>

            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white drop-shadow-md">
              {item.product}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80 line-clamp-2">
              {item.description}
            </p>

            <div className="mt-3 flex items-center gap-3 text-white/85">
              <div className="flex items-center gap-1.5 text-sm font-bold bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{item.merchant.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-white/50">{item.category}</span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 relative">
              <span className="text-xl font-black text-white tracking-tight">{item.price}</span>
              <button
                type="button"
                aria-label="Buy"
                className="rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-white/20"
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
        shares={item.shares || 0}
        saves={displaySaves}
        liked={liked}
        onToggleLike={handleToggleLike}
        saved={saved}
        onToggleSave={handleToggleSave}
        onOpenComments={() => setCommentsOpen(true)}
        onShare={handleShare}
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
