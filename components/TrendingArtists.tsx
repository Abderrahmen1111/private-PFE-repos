"use client";

import React from 'react';
import { HeroSection } from '@/components/ui/trending-artists';

const trendingArtistImages = [
  {
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300&h=300&fit=crop",
    alt: 'Trending artist performing on stage',
  },
  {
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop",
    alt: 'Artist with guitar in studio',
  },
  {
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
    alt: 'DJ performing at a music event',
  },
  {
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop",
    alt: 'Singer performing under stage lights',
  },
  {
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
    alt: 'Musician playing piano',
  },
];

const title = (
  <>
    Discover{' '}
    <span className="text-white">
      Trending Products
    </span>{' '}
    Right Now
  </>
);

export default function TrendingArtists() {
  return (
    <div className="w-full text-white">
      <HeroSection
        title={title}
        subtitle="Explore the hottest artists making waves on the Phantom Marketplace. Find, collect, and support the next generation of talent."
        images={trendingArtistImages}
      />
    </div>
  );
}