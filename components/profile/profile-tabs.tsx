'use client';

import { Star, Heart, Activity, Settings, ShoppingBag, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'reviews' | 'saved' | 'activity' | 'settings' | 'orders' | 'reservations';

interface ProfileTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: { reviews: number; saved: number; activity: number; orders: number; reservations: number };
  /** Tabs not shown in the bar (e.g. `settings` opened only via “Modifier le profil”). */
  excludeTabs?: TabId[];
}

const allTabs: { id: TabId; label: string; icon: any; count?: keyof ProfileTabsProps['counts'] }[] = [
  { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: 'orders' },
  { id: 'reservations', label: 'Réservations', icon: CalendarDays, count: 'reservations' },
  { id: 'reviews', label: 'Avis', icon: Star, count: 'reviews' },
  { id: 'saved', label: 'Favoris', icon: Heart, count: 'saved' },
  { id: 'activity', label: 'Activité', icon: Activity, count: 'activity' },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function ProfileTabs({ activeTab, onTabChange, counts, excludeTabs = [] }: ProfileTabsProps) {
  const tabs = allTabs.filter((t) => !excludeTabs.includes(t.id));
  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-1.5 sticky top-4 z-30">
      <div className="flex overflow-x-auto scrollbar-hide relative gap-1">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`group relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-black whitespace-nowrap transition-all duration-300 rounded-xl flex-1 justify-center sm:flex-none ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10">{label}</span>
              
              {count && counts[count] > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[count]}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-50 border border-indigo-100/50 rounded-xl -z-0"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}