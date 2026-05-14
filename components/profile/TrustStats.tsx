'use client';

import { UserStats } from './types';
import { MessageSquare, ThumbsUp, Star } from 'lucide-react';

interface TrustStatsProps {
  stats: UserStats | null;
  loading: boolean;
}

export function TrustStats({ stats, loading }: TrustStatsProps) {
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const metrics = [
    {
      icon: MessageSquare,
      label: 'Reviews',
      value: stats.total_reviews,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: ThumbsUp,
      label: 'Helpful',
      value: stats.helpful_votes,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Star,
      label: 'Rating',
      value: stats.average_rating.toFixed(1),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`${metric.bgColor} rounded-2xl p-6 flex flex-col items-center gap-2`}
              >
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-gray-600 text-sm font-medium">
                  {metric.label}
                </span>
                <span className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
