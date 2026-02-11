'use client';

import { Business } from '@/lib/mockBusinesses';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessCardProps {
  business: Business;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export default function BusinessCard({ business, isHighlighted, onClick }: BusinessCardProps) {
  const router = useRouter();

  const handleClick = () => {
    onClick?.();
    router.push(`/business/${business.id}`);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-orange-400 text-orange-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden w-2 absolute">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md hover:shadow-xl'}
      `}
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={business.image}
            alt={business.name}
            className="w-40 h-40 object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
            {business.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {renderStars(business.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {business.rating} ({business.reviewCount} reviews)
            </span>
          </div>

          {/* Category & Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-700">{business.category}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm font-semibold text-gray-600">
              {business.priceRange}
            </span>
          </div>

          {/* Status */}
          <div className="mb-3">
            {business.isOpen ? (
              <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                Open now
              </span>
            ) : (
              <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                Closed
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {business.description}
          </p>

          {/* Address */}
          <p className="text-sm text-gray-500 mt-2">
            {business.location.address}
          </p>
        </div>
      </div>
    </div>
  );
}