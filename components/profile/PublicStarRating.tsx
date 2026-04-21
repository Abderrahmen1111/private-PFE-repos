'use client';

import { Star } from 'lucide-react';

interface PublicStarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function PublicStarRating({
  rating,
  size = 'sm',
  showValue = false,
  className = '',
}: PublicStarRatingProps) {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  const px = sizeMap[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`${px} transition-colors ${
              i <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-100 text-gray-200'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className={`${textMap[size]} font-bold text-gray-800 ml-0.5`}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
