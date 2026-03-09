'use client';

import { Star, Heart, Activity, Settings } from 'lucide-react';

export type TabId = 'reviews' | 'saved' | 'activity' | 'settings';

interface ProfileTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: { reviews: number; saved: number; activity: number };
}

const tabs: { id: TabId; label: string; icon: any; count?: keyof ProfileTabsProps['counts'] }[] = [
  { id: 'reviews', label: 'Reviews', icon: Star, count: 'reviews' },
  { id: 'saved', label: 'Saved Places', icon: Heart, count: 'saved' },
  { id: 'activity', label: 'Activity', icon: Activity, count: 'activity' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfileTabs({ activeTab, onTabChange, counts }: ProfileTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-2">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count && counts[count] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[count]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}