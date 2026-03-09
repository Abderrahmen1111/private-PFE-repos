'use client';

import { Star, ThumbsUp, MoreHorizontal } from 'lucide-react';

interface ReviewCardProps {
  businessName: string;
  businessImage: string;
  businessCategory: string;
  rating: number;
  reviewText: string;
  date: string;
  helpfulCount?: number;
}

export default function ReviewCard({
  businessName, businessImage, businessCategory,
  rating, reviewText, date, helpfulCount = 0
}: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group">
      <div className="flex gap-4">
        {/* Business image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <img src={businessImage} alt={businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{businessName}</h3>
              <span className="text-xs text-gray-400">{businessCategory}</span>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">{date}</span>
          </div>

          {/* Review text */}
          <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{reviewText}</p>

          {/* Helpful */}
          {helpfulCount > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50">
                <ThumbsUp className="w-3 h-3" />
                {helpfulCount} found this helpful
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}