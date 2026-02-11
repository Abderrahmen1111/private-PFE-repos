'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedCollections from '@/components/FeaturedCollections';
import TrendingArtists from '@/components/TrendingArtists';
import Footer from '@/components/Footer';

// Dynamically import BackgroundScene with no SSR
const BackgroundScene = dynamic(
  () => import('@/components/BackgroundScene'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      {/* 3D Background - Behind everything */}
      <BackgroundScene />
      
      {/* Content Layers - In front */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar/>
        <Hero/>

<Footer/>
      </div>
    </main>
  );
}
