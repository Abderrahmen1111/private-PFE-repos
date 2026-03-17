'use client';

import { TimeSlot } from './types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selected, onSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isFull     = slot.spotsLeft === 0;
        const isFewLeft  = slot.spotsLeft !== undefined && slot.spotsLeft > 0 && slot.spotsLeft <= 3;
        const isSelected = selected === slot.time;

        return (
          <button
            key={slot.time}
            disabled={isFull || !slot.available}
            onClick={() => onSelect(slot.time)}
            className={`
              relative py-2 px-1 rounded-lg text-sm font-medium transition-all border
              ${isFull || !slot.available
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                : isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 scale-[1.03]'
                  : isFewLeft
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
              }
            `}
          >
            {slot.time}
            {isFewLeft && !isSelected && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Generates time slots for a given date (mock — replace with real Supabase query)
export function generateTimeSlots(): TimeSlot[] {
  return [
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: true, spotsLeft: 2 },
    { time: '13:30', available: true },
    { time: '14:00', available: false, spotsLeft: 0 },
    { time: '14:30', available: true },
    { time: '18:00', available: true },
    { time: '18:30', available: true, spotsLeft: 1 },
    { time: '19:00', available: true },
    { time: '19:30', available: false, spotsLeft: 0 },
    { time: '20:00', available: true },
    { time: '20:30', available: true },
  ];
}