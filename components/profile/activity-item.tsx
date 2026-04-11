'use client';

import { Star, Heart, Eye, UserPlus, MessageCircle, ShoppingBag } from 'lucide-react';

type ActivityType = 'review' | 'saved' | 'visited' | 'joined' | 'comment' | 'order';

interface ActivityItemProps {
  type: ActivityType;
  text: string;
  timestamp: string;
  businessName?: string;
  isLast?: boolean;
}

const activityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
  saved: { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
  visited: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
  joined: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  comment: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  order: { icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100' },
};

export default function ActivityItem({ type, text, timestamp, businessName, isLast }: ActivityItemProps) {
  const config = activityConfig[type] || activityConfig['visited'];
  const { icon: Icon, color, bg } = config;

  return (
    <div className="flex gap-4 group">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-800">
            {text}
            {businessName && (
              <span className="font-semibold text-blue-600 ml-1 cursor-pointer hover:underline">{businessName}</span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}