'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Tag, Star, Clock, TrendingUp, Flame, Clapperboard } from 'lucide-react';
import {
  Stories,
  StoriesContent,
  StoryThumbnail,
  StoryImage,
  StoryOverlay,
  StoryBadge,
  StoryDuration,
  StoryInfo,
  StoryAvatar,
  StoryMeta,
  StoryTitle,
  StoryViews,
  StoryCard,
  Story,
  StoryVideo,
} from '@/components/ui/stories-carousel';
import { getPersonalizedReels } from '@/lib/actions/recommendations';
import { DiscoverFeedItem } from '@/components/discover/feed-algorithm';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShortAd = {
  id: string;
  brand: string;
  tagline: string;
  discount: string;
  image: string;
  avatar: string;
  textColor: string;
  views: string;
  duration: string;
  isNew?: boolean;
  thumbnailUrl?: string;
  mediaType?: 'image' | 'video';
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  food: 'text-orange-900',
  fashion: 'text-blue-900',
  tech: 'text-green-900',
  beauty: 'text-rose-900',
  home: 'text-violet-900',
  lifestyle: 'text-cyan-900',
};

const formatViewCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K views`;
  return `${count} views`;
};

const formatDuration = (ms?: number): string => {
  if (!ms) return '0:30';
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60));
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const mapReelToShortAd = (reel: DiscoverFeedItem): ShortAd => ({
  id: reel.id,
  brand: reel.merchantName,
  tagline: reel.product,
  discount: reel.price,
  image: reel.image,
  avatar: reel.image,
  textColor: colorMap[reel.category] || 'text-slate-900',
  views: formatViewCount(reel.likes || 0),
  duration: '0:30',
  isNew: false,
  thumbnailUrl: reel.thumbnailUrl,
  mediaType: reel.mediaType,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShortAdsSection() {
  const router = useRouter();
  const [shortAds, setShortAds] = useState<ShortAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setIsLoading(true);
        const reels = await getPersonalizedReels();
        const mappedAds = reels.slice(0, 12).map(mapReelToShortAd);
        setShortAds(mappedAds);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch reels:', err);
        setError('Failed to load reels');
        setShortAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReels();
  }, []);

  const handleAdClick = (adId: string) => {
    router.push(`/discover?reelId=${adId}`);
  };

  return (
    <section className="py-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          {/* YouTube Shorts-style camera icon + label */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#ffffff] flex items-center justify-center shadow-sm">
              <Clapperboard className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-[#000000]">
              explore
            </h2>
          </div>
        </div>


      </div>

      <div className="px-0.5">
        <Stories>
          <StoriesContent className="-ml-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <Story key={`skeleton-${i}`} className="basis-[150px]">
                  <div className="w-full">
                    <div className="w-full rounded-xl bg-slate-700 animate-pulse" style={{ aspectRatio: '9/16' }} />
                    <div className="mt-2 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                      <div className="h-2 bg-slate-700 rounded animate-pulse" />
                    </div>
                  </div>
                </Story>
              ))
            ) : error || shortAds.length === 0 ? (
              <Story className="basis-[150px]">
                <div className="text-xs text-slate-500 text-center">
                  {error || 'No reels available'}
                </div>
              </Story>
            ) : (
              shortAds.map((ad) => (
              <Story key={ad.id} isNew={ad.isNew} className="basis-[150px]">
                <div onClick={() => handleAdClick(ad.id)} className="w-full">
                  {/* ── Thumbnail ── */}
                  <StoryThumbnail>
                    {ad.mediaType === 'video' ? (
                      <StoryVideo 
                        src={ad.image} 
                        poster={ad.thumbnailUrl || undefined}
                      />
                    ) : (
                      <StoryImage alt={`${ad.brand} short ad`} src={ad.thumbnailUrl || ad.image} />
                    )}
                    <StoryOverlay side="top" className="h-14 from-black/60" />
                    <StoryOverlay side="bottom" className="h-20 from-black/70" />
                    <span className="absolute bottom-2 left-2 z-20 inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#22C55E] text-[#0A0A0A] shadow-md">
                      {ad.discount}
                    </span>
                    <StoryDuration>{ad.duration}</StoryDuration>
                  </StoryThumbnail>

                  {/* ── Info below thumbnail ── */}
                  <StoryInfo className="mt-2">
                    <StoryAvatar
                      src={ad.avatar}
                      name={ad.brand}
                      fallback={ad.brand[0]}
                    />
                    <StoryMeta>
                      <StoryTitle className="text-[11px] leading-tight">{ad.tagline}</StoryTitle>
                      <StoryViews className="text-[10px]">
                        <span className={`font-semibold ${ad.textColor}`}>{ad.brand}</span>
                        {' · '}{ad.views}
                      </StoryViews>
                    </StoryMeta>
                  </StoryInfo>
                </div>
              </Story>
              ))
            )}

            {/* ── "See all" ghost card at the end ── */}
            {!isLoading && <Story className="basis-[150px]">
              <button
                onClick={() => router.push('/discover')}
                className="w-full rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] flex flex-col items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors hover:scale-105 active:scale-95"
                style={{ aspectRatio: '9/16' }}
              >
                <span className="text-2xl">→</span>
                <span className="text-[11px] font-semibold text-center leading-tight px-2">See all shorts</span>
              </button>
            </Story>}
          </StoriesContent>
        </Stories>
      </div>
    </section>
  );
}