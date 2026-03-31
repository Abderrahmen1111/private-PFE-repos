'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-gray-200"
    >
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6 relative">
        <Icon className="w-10 h-10 text-indigo-500 relative z-10" />
        <div className="absolute inset-0 bg-indigo-200 blur-2xl opacity-20" />
      </div>
      
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">{title}</h3>
      <p className="text-sm font-medium text-gray-500 max-w-[260px] leading-relaxed mb-8">
        {description}
      </p>
      
      {actionLabel && (
        <button 
          onClick={onAction}
          className="px-8 py-3 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/10"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
