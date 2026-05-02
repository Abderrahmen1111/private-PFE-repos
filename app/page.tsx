'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrendingArtists from '@/components/TrendingArtists';
import Footer from '@/components/Footer';
import OffersCarouselDemo from '@/components/OffersCarouselDemoBusiness';
import Sponsors from '@/components/SponsorsDemo';
import Offers from '@/components/Offers';
import { CommerceHero } from '@/components/commerce-hero';
import { LogoCarouselDemo } from "@/components/ui/testimonials";
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant";
import ShortAdsSection from '@/components/ShortAdsSection';
import { SmartStrip, type SmartStripItem } from '@/components/SmartStrip';

const BackgroundScene = dynamic(
  () => import('@/components/BackgroundScene'),
  { ssr: false }
);

const STRIP_ITEMS: SmartStripItem[] = [
  { id: '1', icon: '🔥', label: 'Flash Sale',  price: '-40%',  isTrending: true,  badge: 'trending' },
  { id: '2', icon: '👟', label: 'Sneakers',    price: '29dt',  isTrending: true,  badge: 'hot' },
  { id: '3', icon: '📱', label: 'Tech Deals',  price: '-30%',  isTrending: false, badge: 'new' },
  { id: '4', icon: '🎮', label: 'Gaming',      price: '5dt',   isTrending: true,  badge: 'trending' },
  { id: '5', icon: '👗', label: 'Fashion',     price: '-25%',  isTrending: false, badge: 'hot' },
  { id: '6', icon: '🏋️', label: 'Fitness',    price: '12dt',  isTrending: false },
  { id: '7', icon: '🍕', label: 'Food',        price: '-15%',  isTrending: true,  badge: 'new' },
  { id: '8', icon: '✈️', label: 'Travel',     price: '99dt',  isTrending: false },
  { id: '9', icon: '💄', label: 'Beauty',      price: '-20%',  isTrending: true,  badge: 'trending' },
  { id: '10', icon: '🛋️', label: 'Home',      price: '8dt',   isTrending: false, badge: 'hot'      },
  { id: '1', icon: '🔥', label: 'Flash Sale',  price: '-40%',  isTrending: true,  badge: 'trending' },
  { id: '2', icon: '👟', label: 'Sneakers',    price: '29dt',  isTrending: true,  badge: 'hot'      },
  { id: '3', icon: '📱', label: 'Tech Deals',  price: '-30%',  isTrending: false, badge: 'new'      },
  { id: '4', icon: '🎮', label: 'Gaming',      price: '5dt',   isTrending: true,  badge: 'trending' },
  { id: '5', icon: '👗', label: 'Fashion',     price: '-25%',  isTrending: false, badge: 'hot'      },
];

export default function Home() {
  const [isFiltering, setIsFiltering] = useState(false);
  const handleFilterSelect = (item: any) => {
    if (!item) return;
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 350);
  };

  return (
    <main className="relative min-h-screen">
      <BackgroundScene />

      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />

        {/* Spacer to prevent content overlay from fixed Navbar */}
        <div className="h-24 md:h-28" />

        {/* Smart Strip — between shorts and offers for max attention */}


        <div className={`transition-all duration-300 ${isFiltering ? 'opacity-40 blur-[2px] scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
  <div className="ml-4 md:ml-6 lg:ml-8">
    <ShortAdsSection />
  </div>
          <Offers />
          <OffersCarouselDemo />
        
        {/*   <Hero />   
        <Sponsors />
        
        <TrendingArtists />
        <CommerceHero />
         */}
        <LogoCarouselDemo /> 

        <Footer />
        </div>
      </div>

      <FloatingAiAssistant />
    </main>
  );
}