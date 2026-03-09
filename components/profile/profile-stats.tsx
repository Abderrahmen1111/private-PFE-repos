'use client';

import { Star, Heart, MapPin, TrendingUp } from 'lucide-react';

interface ProfileStatsProps {
  reviewsCount: number;
  savedCount: number;
  citiesCount: number;
  helpfulVotes?: number;
}

export default function ProfileStats({ reviewsCount, savedCount, citiesCount, helpfulVotes = 0 }: ProfileStatsProps) {
  const stats = [
    { icon: Star, label: 'Reviews', value: reviewsCount, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { icon: Heart, label: 'Saved Places', value: savedCount, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { icon: MapPin, label: 'Cities', value: citiesCount, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: TrendingUp, label: 'Helpful Votes', value: helpfulVotes, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
        <div key={label} className={`bg-white rounded-xl p-4 border ${border} shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow`}>
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}