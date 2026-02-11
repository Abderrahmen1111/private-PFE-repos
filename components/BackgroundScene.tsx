'use client';

import { useEffect, useRef, useState } from 'react';

// Add your video playlist here
const VIDEO_PLAYLIST = [
  '/v1.mp4',
  '/v2.mp4',
  '/v3.mp4',
  '/v4.mp4',
  '/v5.mp4',

  // Add more videos as needed
];

export default function BackgroundScene() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle video end and transition to next
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      // Only transition if we have multiple videos
      if (VIDEO_PLAYLIST.length > 1) {
        setIsTransitioning(true);
        
        // Wait for fade out, then change video
        setTimeout(() => {
          setCurrentVideoIndex((prevIndex) => 
            (prevIndex + 1) % VIDEO_PLAYLIST.length
          );
          setIsTransitioning(false);
        }, 500); // Match this with CSS transition duration
      }
    };

    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset and load new video
    video.load();

    const playVideo = async () => {
      try {
        await video.play();
        setIsLoaded(true);
      } catch (error) {
        console.log('Autoplay prevented:', error);
        // Fallback: try playing on user interaction
        const playOnInteraction = async () => {
          try {
            await video.play();
            setIsLoaded(true);
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          } catch (err) {
            console.error('Could not play video:', err);
          }
        };
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
      }
    };

    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, [currentVideoIndex]);

  return (
    <div 
      className="fixed inset-0 w-full h-full background-scene overflow-hidden" 
      style={{ 
        zIndex: 0,
        background: '#000000',
      }}
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: isLoaded && !isTransitioning ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_PLAYLIST[currentVideoIndex]} type="video/mp4" />
        </video>

        {/* Gradient Overlay - Top to Bottom */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 13, 26, 0.85) 0%, rgba(2, 4, 8, 0.4) 40%, rgba(2, 4, 8, 0.7) 100%)',
          }}
        />

        {/* Vignette Effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />

        {/* Subtle Blue Tint Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: 'linear-gradient(135deg, rgba(68, 136, 255, 0.08) 0%, rgba(51, 102, 255, 0.12) 100%)',
          }}
        />

        {/* Animated Gradient Accent */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(68, 136, 255, 0.1) 50%, transparent 100%)',
            animation: 'gradientShift 15s ease-in-out infinite',
          }}
        />
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0a0d1a] to-[#020408]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#4488ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#4488ff] text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Animated Particles Overlay (Optional) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="particle-container">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                background: '#4488ff',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Video Progress Indicator (Optional) */}
      {VIDEO_PLAYLIST.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-none z-10">
          {VIDEO_PLAYLIST.map((_, index) => (
            <div
              key={index}
              className="transition-all duration-300"
              style={{
                width: currentVideoIndex === index ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentVideoIndex === index 
                  ? 'rgba(68, 136, 255, 0.8)' 
                  : 'rgba(68, 136, 255, 0.3)',
              }}
            />
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-10%) translateY(-10%);
          }
          50% {
            opacity: 0.5;
            transform: translateX(10%) translateY(10%);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 50}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}