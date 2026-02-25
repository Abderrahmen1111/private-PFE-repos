'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrendingArtists from '@/components/TrendingArtists';
import Footer from '@/components/Footer';
import OffersCarouselDemo from '@/components/OffersCarouselDemoBusiness';
import Sponsors from '@/components/SponsorsDemo';
import Offers from '@/components/Offers';
import { CommerceHero } from '@/components/commerce-hero';
import { LogoCarouselDemo } from "@/components/ui/testimonials"
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant"
const BackgroundScene = dynamic(
  () => import('@/components/BackgroundScene'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* 3D Background - Behind everything */}
      <BackgroundScene />

      {/* Content Layers - In front */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />
        <Hero />
        <Offers />
        <OffersCarouselDemo />
        <Sponsors />
        <TrendingArtists />
        <CommerceHero />
        <LogoCarouselDemo />
        {/*<BusinessImageGalleryx/> */}
        <Footer />
      </div>
      <FloatingAiAssistant />
    </main>
  );
}