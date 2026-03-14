'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function DatePicker({ selected, onChange }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Don't allow going back before current month
  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          const isPast     = date < today;
          const isToday    = date.getTime() === today.getTime();
          const isSelected = selected
            ? date.getTime() === new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime()
            : false;

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onChange(date)}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-all font-medium
                ${isPast
                  ? 'text-slate-300 cursor-not-allowed'
                  : isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                    : isToday
                      ? 'border-2 border-blue-400 text-blue-600 hover:bg-blue-50'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}