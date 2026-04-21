'use client';

import { motion } from 'framer-motion';
import { Star, Award, Trophy, Calendar, Heart, ShoppingBag, Zap, Lock } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  award: Award,
  trophy: Trophy,
  calendar: Calendar,
  heart: Heart,
  'shopping-bag': ShoppingBag,
  zap: Zap,
};

interface PublicBadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  index?: number;
}

export default function PublicBadge({ title, description, icon, earned, index = 0 }: PublicBadgeProps) {
  const Icon = ICON_MAP[icon] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative group rounded-2xl border p-4 transition-all duration-300 overflow-hidden
        ${earned
          ? 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40'
          : 'bg-gray-50/60 border-gray-100 opacity-55'
        }`}
    >
      {/* hover glow */}
      {earned && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.07) 0%, transparent 70%)' }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon area */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
          ${earned
            ? 'bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200'
            : 'bg-gray-100'
          }`}
        >
          {earned
            ? <Icon className="w-5 h-5 text-indigo-600" />
            : <Lock className="w-4 h-4 text-gray-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold tracking-tight ${earned ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-[11px] mt-0.5 leading-relaxed ${earned ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
        </div>

        {earned && (
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}
