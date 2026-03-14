'use client';

import { Minus, Plus, Users } from 'lucide-react';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function GuestSelector({ value, onChange, min = 1, max = 10 }: GuestSelectorProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Guests</p>
          <p className="text-xs text-slate-400">Max {max} people</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-base font-bold text-slate-800">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}