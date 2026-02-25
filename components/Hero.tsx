'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MoveRight, RocketIcon, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  /* GSAP entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from(titleRef.current, { y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
        .from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .from(videoWrapRef.current, { x: 60, opacity: 0, duration: 1.1, ease: 'power3.out' }, '-=0.9');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* Robust Video control */
  useEffect(() => {
    const video = videoElRef.current;
    if (!video) return;

    let cancelled = false;

    const attemptPlay = async () => {
      if (cancelled) return;
      try {
        video.muted = true;
        await video.play();
        if (!cancelled) {
          setIsPlaying(true);
          setIsMuted(true);
        }
      } catch (err) {
        console.log('Hero autoplay blocked:', err);
        const handleForcePlay = async () => {
          try {
            await video.play();
            if (!cancelled) setIsPlaying(true);
            document.removeEventListener('click', handleForcePlay);
          } catch (e) {
            console.error('Manual play failed:', e);
          }
        };
        document.addEventListener('click', handleForcePlay, { once: true });
      }
    };

    video.load();
    video.addEventListener('canplay', attemptPlay, { once: true });

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', attemptPlay);
    };
  }, []);

  const togglePlay = () => {
    if (!videoElRef.current) return;
    if (isPlaying) {
      videoElRef.current.pause();
      setIsPlaying(false);
    } else {
      videoElRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoElRef.current) return;
    const newMuted = !isMuted;
    videoElRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center px-6 py-16 lg:py-24">
      <div className="container mx-auto max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT: text */}
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="inline-flex items-center rounded-full border-gray-300 bg-white text-xs md:text-sm px-4 py-1.5 font-medium text-gray-700 shadow-sm"
            >
              We&apos;re live!
            </Badge>

            <div className="space-y-6">
              <h1
                ref={titleRef}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem] tracking-tight font-semibold text-white leading-[1.05]"
              >
                Découvrez les meilleurs commerces
                <br />
                autour de vous.
              </h1>
              <p
                ref={subtitleRef}
                className="text-base md:text-lg leading-relaxed text-white/70 max-w-xl"
              >
                Explorez, découvrez, connectez-vous.
                <br />
                tout en profitant des meilleures offres.
                <br />
                Ro2ya est là pour vous. 
                <br />
                Tout ce que vous cherchez, près de vous.
                <br />
                Votre ville, comme vous ne l’avez jamais vue.
                <br />
                
              </p>
            </div>

            <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
              <Link href="/register" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-gray-300 bg-white text-sm md:text-base px-5 py-2.5 text-gray-900 hover:bg-gray-50"
                  asChild
                >
                  <a className="flex items-center gap-2">
                    <RocketIcon className="w-4 h-4" />
                    start for free
                  </a>
                </Button>
              </Link>
              <Button className="flex items-center gap-2 rounded-full bg-black text-white text-sm md:text-base px-6 py-2.5 hover:bg-black/90">
                why we build this
                <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT: demo video */}
          <div ref={videoWrapRef} className="relative group">

            {/* ambient glow ring */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-red-600/30 via-white/5 to-blue-600/20 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

            {/* card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 backdrop-blur-sm">

              {/* fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/70 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/90" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/90" />
                  <div className="w-3 h-3 rounded-full bg-green-500/90" />
                </div>
                <div className="flex-1 mx-3 h-6 rounded-md bg-white/10 flex items-center px-3">
                  <span className="text-white/40 text-xs font-mono tracking-wide">ro2ya.app · live demo</span>
                </div>
              </div>

              {/* video */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoElRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src="/demo.mp4"
                  poster=""
                />

                {/* play/pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-transform hover:scale-110"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
                  </button>
                </div>

                {/* bottom control bar */}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white/60 text-xs font-medium">Product walkthrough · 2 min</span>
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* caption strip */}
              <div className="px-5 py-4 bg-black/60 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">See how it works</p>
                  <p className="text-white/40 text-xs mt-0.5">No signup required</p>
                </div>
                <Link href="/register">
                  <button className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all active:scale-95">
                    Try it free →
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}