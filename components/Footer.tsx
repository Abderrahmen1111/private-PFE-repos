'use client';

import { useRef, useState, useEffect } from 'react';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Show footer immediately on scroll
      setHidden(false);

      // Set a new timeout to hide after 2 seconds of no scrolling
      hideTimeoutRef.current = setTimeout(() => {
        setHidden(true);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        z-40
        px-6 py-3
        backdrop-blur-md
        bg-black/60
        border border-white/10
        rounded-full
        shadow-[0_0_40px_rgba(255,255,255,0.05)]
        transition-transform duration-300
        ${hidden ? 'translate-y-[calc(100%+1.5rem)]' : 'translate-y-0'}
      `}
    >
      <div className="flex items-center gap-6 text-xs text-white/70 tracking-wide">
        <span className="opacity-60">© 2026</span>

        <div className="w-px h-3 bg-white/20" />

        <a className="hover:text-white transition">Privacy</a>
        <a className="hover:text-white transition">Terms</a>
        <a className="hover:text-white transition">Contact</a>

        <div className="w-px h-3 bg-white/20" />

        <span className="opacity-60">Phantom</span>
      </div>
    </footer>
  );
}
