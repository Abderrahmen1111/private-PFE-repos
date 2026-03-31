'use client';

import { Star, Heart, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileStatsProps {
  reviewsCount: number;
  savedCount: number;
  citiesCount: number;
  helpfulVotes?: number;
}

export default function ProfileStats({ reviewsCount, savedCount, citiesCount, helpfulVotes = 0 }: ProfileStatsProps) {
  const stats = [
    { icon: Star, label: 'Reviews', value: reviewsCount, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100/50', glow: 'group-hover:shadow-amber-200/50' },
    { icon: Heart, label: 'Saved Places', value: savedCount, color: 'text-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100/50', glow: 'group-hover:shadow-rose-200/50' },
    { icon: MapPin, label: 'Cities', value: citiesCount, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100/50', glow: 'group-hover:shadow-blue-200/50' },
    { icon: TrendingUp, label: 'Helpful Votes', value: helpfulVotes, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100/50', glow: 'group-hover:shadow-emerald-200/50' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map(({ icon: Icon, label, value, color, bg, border, glow }) => (
        <motion.div 
          variants={item}
          key={label} 
          className={`group bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-gray-100 flex items-center gap-4 hover:border-gray-200 hover:shadow-xl ${glow} transition-all duration-300 cursor-default hover:-translate-y-1`}
        >
          <div className={`w-12 h-12 rounded-xl ${bg} ${border} border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none tracking-tighter">{value}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}