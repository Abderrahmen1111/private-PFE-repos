'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MoveRight, PhoneCall, RocketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
        .from(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6',
        )
        .from(
          ctaRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5',
        );
    }, heroRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center px-6 py-16 lg:py-24"
    >
      <div className="container mx-auto max-w-6xl w-full">
        <div className="flex flex-col items-start gap-10">
          {/* Left content */}
          <div className="space-y-8 max-w-3xl">
            {/* Badge */}
            <Badge
              variant="outline"
              className="inline-flex items-center rounded-full border-gray-300 bg-white text-xs md:text-sm px-4 py-1.5 font-medium text-gray-700 shadow-sm"
            >
              We&apos;re live!
            </Badge>

            {/* Main Heading & Copy */}
            <div className="space-y-6">
              <h1
                ref={titleRef}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem] tracking-tight font-semibold text-white leading-[1.05]"
              >
                This is the start of
                <br />
                something!
              </h1>

              <p
                ref={subtitleRef}
                className="text-base md:text-lg leading-relaxed text-black max-w-xl"
              >
                Managing a small business today is already tough. Avoid further complications
                by ditching outdated, tedious trade methods. Our goal is to streamline SMB
                trade, making it easier and faster than ever.
              </p>
            </div>

            {/* CTAs */}
            <div
              ref={ctaRef}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full border-gray-300 bg-white text-sm md:text-base px-5 py-2.5 text-gray-900 hover:bg-gray-50"
              >
                <RocketIcon className="w-4 h-4" />
                start for free
              </Button>

              <Button
                className="flex items-center gap-2 rounded-full bg-black text-white text-sm md:text-base px-6 py-2.5 hover:bg-black/90"
              >
                why we build this
                <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}