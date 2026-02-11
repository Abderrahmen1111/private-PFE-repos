'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const collections = [
  {
    id: 1,
    title: 'Cyber Dreams',
    artist: 'Aria Nova',
    price: '2.5 ETH',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 2,
    title: 'Neon Nights',
    artist: 'Max Volt',
    price: '3.2 ETH',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 3,
    title: 'Digital Horizons',
    artist: 'Luna Star',
    price: '1.8 ETH',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 4,
    title: 'Abstract Realms',
    artist: 'Echo Wave',
    price: '4.1 ETH',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 5,
    title: 'Cosmic Visions',
    artist: 'Nova Prime',
    price: '2.9 ETH',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 6,
    title: 'Future Artifacts',
    artist: 'Zeta Core',
    price: '5.5 ETH',
    color: 'from-yellow-500 to-orange-600',
  },
];

export default function FeaturedCollections() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <section ref={sectionRef} className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Featured Collections
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Curated selections from top digital artists
          </p>
        </div>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer"
            >
              {/* Image Placeholder with Gradient */}
              <div className={`aspect-square bg-gradient-to-br ${collection.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/20">
                  {collection.id}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {collection.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">by {collection.artist}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current Price</div>
                    <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {collection.price}
                    </div>
                  </div>
                  <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all transform group-hover:scale-105">
                    View
                  </button>
                </div>
              </div>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-2xl pointer-events-none transition-all duration-300" />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-4 rounded-lg border-2 border-white/20 hover:bg-white/10 transition-all text-lg font-semibold backdrop-blur-sm">
            View All Collections
          </button>
        </div>
      </div>
    </section>
  );
}
