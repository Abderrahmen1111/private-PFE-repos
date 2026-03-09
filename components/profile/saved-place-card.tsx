'use client';

import { Star, MapPin, Heart, ExternalLink } from 'lucide-react';

interface SavedPlaceCardProps {
  name: string;
  image: string;
  rating: number;
  category: string;
  location: string;
  savedDate: string;
}

export default function SavedPlaceCard({ name, image, rating, category, location, savedDate }: SavedPlaceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        </button>
        <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
        </button>
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-lg">
          {category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{location}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Saved {savedDate}</p>
      </div>
    </div>
  );
}