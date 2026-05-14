'use client';

import { Review } from './types';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
      {/* Header with Business Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {review.business_name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{reviewDate}</p>
        </div>
        {review.business_logo && (
          <Image
            src={review.business_logo}
            alt={review.business_name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-900">
          {review.rating}.0
        </span>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {review.comment.length > 300
          ? `${review.comment.substring(0, 300)}...`
          : review.comment}
      </p>

      {/* Category Tag */}
      <div className="inline-flex">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          {review.category}
        </span>
      </div>
    </div>
  );
}
