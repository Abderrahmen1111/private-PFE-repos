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

import { format, parse, addMinutes, isBefore, isEqual } from 'date-fns';

// Generates time slots for a given day based on business hours
export function generateTimeSlots(
  openTime: string = '09:00',
  closeTime: string = '18:00',
  intervalMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  try {
    let current = parse(openTime, 'HH:mm', new Date());
    const end = parse(closeTime, 'HH:mm', new Date());

    while (isBefore(current, end) || isEqual(current, end)) {
      slots.push({
        time: format(current, 'HH:mm'),
        available: true,
      });
      current = addMinutes(current, intervalMinutes);
    }
  } catch (e) {
    console.error('Error generating time slots:', e);
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
    ];
  }

  return slots;
}