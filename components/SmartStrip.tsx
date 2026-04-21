'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SmartStripItem = {
  id: string;
  icon: string;
  label: string;
  price?: string;
  isTrending?: boolean;
  badge?: 'trending' | 'hot' | 'new' | 'sale';
};

type SmartStripProps = {
  items: SmartStripItem[];
  title?: string;
  onSelect?: (item: SmartStripItem | null) => void;
  className?: string;
};

// ─── Badge config ─────────────────────────────────────────────────────────────

const BADGE = {
  trending: { label: 'Trending', color: '#F97316' },
  hot:      { label: 'Hot',      color: '#ef4444' },
  new:      { label: 'New',      color: '#3b82f6' },
  sale:     { label: 'Sale',     color: '#22C55E' },
} as const;

function isPriceDeal(price: string) {
  return price.startsWith('-') || price.endsWith('%');
}

// ─── Single card ──────────────────────────────────────────────────────────────

type CardProps = {
  item: SmartStripItem;
  isActive: boolean;
  index: number;
  onClick: () => void;
};

function Card({ item, isActive, index, onClick }: CardProps) {
  const priceColor = item.price
    ? isPriceDeal(item.price) ? '#F97316' : '#22C55E'
    : '';

  const badge = item.badge ? BADGE[item.badge] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full h-24 rounded-xl p-3 text-left
                 cursor-pointer select-none outline-none
                 transition-all duration-200 ease-out
                 hover:scale-[1.03] hover:bg-[#222222]
                 active:scale-[0.97]
                 focus-visible:ring-2 focus-visible:ring-[#F97316]/50
                 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
      style={{
        animation: `ss-mount 0.3s ease ${index * 40}ms both`,
        background: isActive ? '#222222' : '#1A1A1A',
        border: `1px solid ${isActive ? '#F97316' : '#2A2A2A'}`,
      }}
      aria-pressed={isActive}
      aria-label={`Filter by ${item.label}${item.price ? `, ${item.price}` : ''}`}
    >
      {/* Trending dot */}
      {item.isTrending && (
        <span className="absolute top-2 right-2 flex h-[6px] w-[6px]">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: '#F97316', animation: 'ss-ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
          />
          <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-[#F97316]" />
        </span>
      )}

      {/* 1. Icon */}
      <span className="text-[26px] leading-none" aria-hidden>
        {item.icon}
      </span>

      {/* 2. Price → 3. Label */}
      <div className="flex flex-col gap-[2px]">
        {badge && (
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.06em] leading-none"
            style={{ color: badge.color }}
          >
            {badge.label}
          </span>
        )}
        {item.price && (
          <span className="text-[13px] font-bold leading-none truncate" style={{ color: priceColor }}>
            {item.price}
          </span>
        )}
        <span className="text-[11px] font-medium text-[#A1A1AA] leading-none truncate">
          {item.label}
        </span>
      </div>
    </button>
  );
}

// ─── SmartStrip ───────────────────────────────────────────────────────────────

export function SmartStrip({ items, title = 'Trending & Offers', onSelect, className = '' }: SmartStripProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (item: SmartStripItem) => {
      setActiveId(prev => {
        const next = prev === item.id ? null : item.id;
        onSelect?.(next ? item : null);
        return next;
      });
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    setActiveId(null);
    onSelect?.(null);
  }, [onSelect]);

  const cards = useMemo(
    () => items.map((item, i) => (
      <Card
        key={item.id}
        item={item}
        isActive={activeId === item.id}
        index={i}
        onClick={() => {
          handleSelect(item);
        }}
      />
    )),
    [items, activeId, handleSelect]
  );

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <>
      <style>{`
        @keyframes ss-mount {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes ss-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes ss-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <section className={`relative w-full ${className}`} aria-label={title}>

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <span className="relative flex h-[7px] w-[7px] flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ backgroundColor: '#F97316', animation: 'ss-ping 2.2s cubic-bezier(0,0,0.2,1) infinite' }}
            />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full" style={{ backgroundColor: '#F97316' }} />
          </span>

          <h2 className="text-[13px] font-semibold text-[#000000] tracking-[-0.02em]">
            {title}
          </h2>

          {activeItem && (
            <span
              className="text-[11px] text-white/35 font-normal"
              style={{ animation: 'ss-fadein 0.18s ease both' }}
            >
              · filtered
            </span>
          )}
        </div>

        {/* ── Grid row ── */}
        <div className="relative">
          <div
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 xl:grid-cols-2 gap-3"
          >
            {cards}
          </div>
        </div>

        {/* ── Active filter caption & Clear Action ── */}
        {activeItem && (
          <div 
            className="mt-2.5 px-0.5 flex items-center gap-2"
            style={{ animation: 'ss-fadein 0.22s ease both' }}
          >
            <p className="text-[11px] text-[#000000] tracking-wide leading-none">
              Feed filtered by{' '}
              <span className="text-[#A1A1AA] font-semibold">{activeItem.label}</span>
            </p>
            
            <span className="text-[#A1A1AA] text-[10px] opacity-40" aria-hidden>•</span>

            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-red-600 hover:text-red-500 transition-colors flex items-center gap-1"
              aria-label="Clear filter"
            >
              Clear ✕
            </button>
          </div>
        )}
      </section>
    </>
  );
}