'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface BottomNavigationProps {
  userId: string;
}

export function BottomNavigation({ userId }: BottomNavigationProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'User Profile',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 sm:hidden z-40">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            isLiked ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart
            className="w-6 h-6"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          <span className="text-xs font-medium">Follow</span>
        </button>

        <button className="flex flex-col items-center gap-1 px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors">
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Message</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
