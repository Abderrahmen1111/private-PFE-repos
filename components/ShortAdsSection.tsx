'use client';

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
} from '@/components/ui/stories-carousel';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShortAd = {
  id: number;
  brand: string;
  tagline: string;
  discount: string;
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
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40&h=40&fit=crop&crop=center',
    textColor: 'text-orange-900',
    views: '2.4M views',
    duration: '0:58',
    isNew: false,
  },
  {
    id: 2,
    brand: 'Apple',
    tagline: 'iPhone 16 Pro — cinematic mode.',
    discount: 'Up to $200 OFF',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=40&h=40&fit=crop',
    textColor: 'text-blue-900',
    views: '5.1M views',
    duration: '0:45',
    isNew: false,
  },
  {
    id: 3,
    brand: 'Zara',
    tagline: 'New season arrivals just landed.',
    discount: '30% OFF',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=40&h=40&fit=crop',
    textColor: 'text-rose-900',
    views: '890K views',
    duration: '0:32',
  },
  {
    id: 4,
    brand: 'Sony',
    tagline: 'WH-1000XM5. Sound. Elevated.',
    discount: '25% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop',
    textColor: 'text-violet-900',
    views: '1.2M views',
    duration: '0:52',
  },
  {
    id: 5,
    brand: 'IKEA',
    tagline: 'Transform your home for less.',
    discount: '15% OFF',  
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=40&h=40&fit=crop',
    textColor: 'text-yellow-900',
    views: '430K views',
    duration: '0:41',
  },
  {
    id: 6,
    brand: 'Adidas',
    tagline: 'Ultraboost 24 — impossible is nothing.',
    discount: '35% OFF',   
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=40&h=40&fit=crop',
    textColor: 'text-green-900',
    views: '3.7M views',
    duration: '0:29',
    isNew: false,
  },
  {
    id: 7,
    brand: 'Dyson',
    tagline: 'Airwrap. Engineering redefined.',
    discount: '$50 OFF', 
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop',
    textColor: 'text-cyan-900',
    views: '670K views',
    duration: '0:37',
  },
  {
    id: 8,
    brand: 'Samsung',
    tagline: 'Galaxy S24 Ultra — epic zoom.',
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=40&h=40&fit=crop',
    textColor: 'text-blue-900',
    views: '2.1M views',
    duration: '0:44',
  },
  {
    id: 9,
    brand: 'Apple',
    tagline: 'iPhone 16 Pro — cinematic mode.',
    discount: 'Up to $200 OFF',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=40&h=40&fit=crop',
    textColor: 'text-blue-900',
    views: '5.1M views',
    duration: '0:45',
    isNew: false,
  },
  {
    id: 10,
    brand: 'Zara',
    tagline: 'New season arrivals just landed.',
    discount: '30% OFF',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=40&h=40&fit=crop',
    textColor: 'text-rose-900',
    views: '890K views',
    duration: '0:32',
  },
  {
    id: 11,
    brand: 'Sony',
    tagline: 'WH-1000XM5. Sound. Elevated.',
    discount: '25% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop',
    textColor: 'text-violet-900',
    views: '1.2M views',
    duration: '0:52',
  },
  {
    id: 12,
    brand: 'IKEA',
    tagline: 'Transform your home for less.',
    discount: '15% OFF',  
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=700&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=40&h=40&fit=crop',
    textColor: 'text-yellow-900',
    views: '430K views',
    duration: '0:41',
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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
          {shortAds.map((ad) => (
            <StoryCard
              key={ad.id}
              isNew={ad.isNew}
              onClick={handleAdClick}
              onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
              className="w-full"
            >
                {/* ── Thumbnail ── */}
                <StoryThumbnail>
                  <StoryImage alt={`${ad.brand} short ad`} src={ad.image} />

                  {/* Top + bottom gradients */}
                  <StoryOverlay side="top" className="h-14 from-black/60" />
                  <StoryOverlay side="bottom" className="h-20 from-black/70" />

                  {/* Badge — top left (Shorts-style) */}


                  {/* Discount pill — bottom left */}
                  <span className="absolute bottom-2 left-2 z-20 inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#22C55E] text-[#0A0A0A] shadow-md">
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
                    <StoryTitle className="text-[11px] leading-tight">{ad.tagline}</StoryTitle>
                    <StoryViews className="text-[10px]">
                      <span className={`font-semibold ${ad.textColor}`}>{ad.brand}</span>
                      {' · '}{ad.views}
                    </StoryViews>
                  </StoryMeta>
                </StoryInfo>
              </StoryCard>
            ))}

          {/* ── "See all" ghost card at the end ── */}
          <div className="flex items-stretch">
            <button
              onClick={() => router.push('/discover')}
              className="w-full rounded-xl border border-dashed border-[#2A2A2A] bg-[#1A1A1A] flex flex-col items-center justify-center gap-2 text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors hover:scale-105 active:scale-95"
              style={{ aspectRatio: '9/16' }}
            >
              <span className="text-2xl">→</span>
              <span className="text-[11px] font-semibold text-center leading-tight px-2">See all shorts</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}