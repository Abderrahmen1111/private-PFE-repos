"use client"

import React from 'react';
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { BlurFade } from "@/components/ui/blur-fade"
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";

// Demo images with 2:3 aspect ratio - using Unsplash images
const cardData = [
  { title: 'Brand Visual', imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=768&h=1344&fit=crop' },
  { title: 'Sketch Style', imageSrc: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=768&h=1344&fit=crop' },
  { title: 'Fake Realism', imageSrc: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=768&h=1344&fit=crop' },
  { title: 'Fashion Poster', imageSrc: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=768&h=1344&fit=crop' },
  { title: 'Food Promotion', imageSrc: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=768&h=1344&fit=crop' },
];

export default function HomePage() {
  // Determine greeting based on current hour
  const hour = new Date().getHours();
  let timeOfDay;
  if (hour < 12) timeOfDay = 'Morning';
  else if (hour < 18) timeOfDay = 'Afternoon';
  else timeOfDay = 'Evening';

  return (
    <div className="min-h-screen bg-white dark:bg-background p-4 md:p-8 relative overflow-y-auto">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
        )}
      />
      
      {/* Header */}
      <header className="text-center mb-8 md:mb-12 relative z-10">
        <BlurFade delay={0.25} inView>
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none font-bold tracking-tighter">
            {`Good ${timeOfDay}, Leon`}
          </h2>
        </BlurFade>
        <div className="opacity-0 h-0">hidden</div>
        <BlurFade delay={0.25 * 2} inView>
          <span className="animate-fade-in font-[Outfit] text-[14px] md:text-[16px] lg:text-[20px] font-normal text-[#737880]">
            Ready to turn your ideas into art?
          </span>
        </BlurFade>
      </header>

      {/* Input Box */}
      <div className="max-w-xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
        <AIInputWithSearch 
          onSubmit={(value, withSearch) => {
            console.log('Message:', value);
            console.log('Search enabled:', withSearch);
          }}
          onFileSelect={(file) => {
            console.log('Selected file:', file);
          }}
        />
      </div>

      {/* Created With Section */}
      <section className="max-w-7xl mx-auto relative z-10 px-4">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Created With Art</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {cardData.map((card) => (
            <div key={card.title} className="relative group rounded-xl overflow-hidden cursor-pointer">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src={card.imageSrc}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 duration-300 transition-all"
                />
              </div>
              <div className="absolute left-4 top-4 flex h-[30px] w-[29px] items-center justify-start gap-1 overflow-hidden rounded-full bg-[rgba(51,51,51,0.8)] transition-all duration-300 group-hover:w-[72px]">
                <img 
                  width={28} 
                  height={28} 
                  src="https://www.lovart.ai/assets/play-s.svg" 
                  alt="play"
                  className="flex-shrink-0"
                />
                <span className="text-[rgba(255,255,255,0.8)] text-[14px] font-[700] whitespace-nowrap">View</span>
              </div>
              <p className="text-center mt-2 font-medium pb-2 text-sm md:text-base">{card.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}