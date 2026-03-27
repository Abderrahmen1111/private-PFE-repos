'use client';

import { useRouter } from 'next/navigation';
import { Zap, Tag, Star, Clock, TrendingUp, Flame, Clapperboard } from 'lucide-react';
import {
  Stories,
  StoriesContent,
  Story,
  StoryThumbnail,
  StoryImage,
  StoryOverlay,
  StoryDuration,
  StoryInfo,
  StoryAvatar,
  StoryMeta,
  StoryTitle,
  StoryViews,
} from '@/components/ui/stories-carousel';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShortAd = {
  id: number;
  brand: string;
  tagline: string;
  discount: string;
  badge: string;
  badgeIcon: React.ReactNode;
  image: string;
  avatar: string;
  textColor: string;
  views: string;
  duration: string;
  isNew?: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const shortAds: ShortAd[] = [
  {
    id: 1,
    brand: 'Nike',
    tagline: 'Run the future. New Air Max drop.',
    discount: '40% OFF',
    badge: 'Flash Deal',
    badgeIcon: <Zap className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40&h=40&fit=crop&crop=center',
    textColor: 'text-orange-300',
    views: '2.4M views',
    duration: '0:58',
    isNew: true,
  },
  {
    id: 2,
    brand: 'Apple',
    tagline: 'iPhone 16 Pro — cinematic mode.',
    discount: 'Up to $200 OFF',
    badge: 'Trending',
    badgeIcon: <TrendingUp className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=40&h=40&fit=crop',
    textColor: 'text-blue-300',
    views: '5.1M views',
    duration: '0:45',
    isNew: true,
  },
  {
    id: 3,
    brand: 'Zara',
    tagline: 'New season arrivals just landed.',
    discount: '30% OFF',
    badge: 'Hot',
    badgeIcon: <Flame className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=40&h=40&fit=crop',
    textColor: 'text-rose-300',
    views: '890K views',
    duration: '0:32',
  },
  {
    id: 4,
    brand: 'Sony',
    tagline: 'WH-1000XM5. Sound. Elevated.',
    discount: '25% OFF',
    badge: 'Top Rated',
    badgeIcon: <Star className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop',
    textColor: 'text-violet-300',
    views: '1.2M views',
    duration: '0:52',
  },
  {
    id: 5,
    brand: 'IKEA',
    tagline: 'Transform your home for less.',
    discount: '15% OFF',
    badge: 'Ends Soon',
    badgeIcon: <Clock className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=40&h=40&fit=crop',
    textColor: 'text-yellow-300',
    views: '430K views',
    duration: '0:41',
  },
  {
    id: 6,
    brand: 'Adidas',
    tagline: 'Ultraboost 24 — impossible is nothing.',
    discount: '35% OFF',
    badge: 'Flash Deal',
    badgeIcon: <Zap className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=40&h=40&fit=crop',
    textColor: 'text-green-300',
    views: '3.7M views',
    duration: '0:29',
    isNew: true,
  },
  {
    id: 7,
    brand: 'Dyson',
    tagline: 'Airwrap. Engineering redefined.',
    discount: '$50 OFF',
    badge: 'Exclusive',
    badgeIcon: <Tag className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop',
    textColor: 'text-cyan-300',
    views: '670K views',
    duration: '0:37',
  },
  {
    id: 8,
    brand: 'Samsung',
    tagline: 'Galaxy S24 Ultra — epic zoom.',
    discount: '20% OFF',
    badge: 'Trending',
    badgeIcon: <TrendingUp className="w-2.5 h-2.5" />,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=40&h=40&fit=crop',
    textColor: 'text-blue-300',
    views: '2.1M views',
    duration: '0:44',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShortAdsSection() {
  const router = useRouter();

  const handleAdClick = () => {
    router.push('/discover');
  };

  return (
    <section className="py-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* YouTube Shorts-style camera icon + label */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center shadow-sm">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Short Ads
            </h2>
          </div>
        </div>

        <button
          onClick={() => router.push('/discover')}
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          See all
          <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
        </button>
      </div>

      {/* ── Carousel ── */}
      {/* Outer wrapper clips the partial last card and adds side padding */}
      <div className="px-4 md:px-6">
        <Stories>
          <StoriesContent className="pb-1">
            {shortAds.map((ad) => (
              <Story
                key={ad.id}
                isNew={ad.isNew}
                onClick={handleAdClick}
                onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
                // Fixed card width — partial visibility of next card creates the
                // "more content" affordance naturally
                className="w-[140px] md:w-[155px] shrink-0"
              >
                {/* ── Thumbnail ── */}
                <StoryThumbnail>
                  <StoryImage alt={`${ad.brand} short ad`} src={ad.image} />

                  {/* Top + bottom gradients */}
                  <StoryOverlay side="top" className="h-14 from-black/60" />
                  <StoryOverlay side="bottom" className="h-20 from-black/70" />



                  {/* Discount pill — bottom left */}
                  <span className="absolute bottom-2 left-2 z-20 inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-white text-black shadow">
                    {ad.discount}
                  </span>

                  {/* Duration — bottom right (YouTube convention) */}
                  <StoryDuration>{ad.duration}</StoryDuration>
                </StoryThumbnail>

                {/* ── Info below thumbnail ── */}
                <StoryInfo>
                  <StoryAvatar
                    src={ad.avatar}
                    name={ad.brand}
                    fallback={ad.brand[0]}
                  />
                  <StoryMeta>
                    <StoryTitle>{ad.tagline}</StoryTitle>
                    <StoryViews>
                      <span className={`font-semibold ${ad.textColor}`}>{ad.brand}</span>
                      {' · '}{ad.views}
                    </StoryViews>
                  </StoryMeta>
                </StoryInfo>
              </Story>
            ))}

            {/* ── "See all" ghost card at the end ── */}
            <div className="pl-3 flex items-stretch">
              <button
                onClick={() => router.push('/discover')}
                className="w-[100px] md:w-[110px] rounded-xl border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                style={{ aspectRatio: '9/16' }}
              >
                <span className="text-2xl">→</span>
                <span className="text-[11px] font-semibold text-center leading-tight px-2">See all shorts</span>
              </button>
            </div>
          </StoriesContent>
        </Stories>
      </div>
    </section>
  );
}