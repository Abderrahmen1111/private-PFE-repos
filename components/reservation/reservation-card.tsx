'use client';

import { useState, useEffect } from 'react';
import { Star, Zap, Flame, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { DatePicker } from './date-picker';
import { TimeSlotGrid, generateTimeSlots } from './time-slot-grid';
import { GuestSelector } from './guest-selector';
import { ReservationSummary } from './reservation-summary';
import { ReservationConfirmationModal } from './reservation-confirmation-modal';
import { ReservationData, ReservationCardProps } from './types';

export function ReservationCard({
  businessId,
  businessName,
  rating,
  reviewCount,
  reservationFee = 5,
  currency = 'TND ',
  onConfirm,
}: ReservationCardProps) {
  const [data, setData] = useState<ReservationData>({
    businessId,
    businessName,
    date: null,
    time: null,
    guests: 2,
    specialRequest: '',
  });

  const [showRequest,  setShowRequest]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [confirmed,    setConfirmed]    = useState(false);
  const [viewersCount, setViewersCount] = useState(0);

  useEffect(() => {
    setViewersCount(Math.floor(Math.random() * 18) + 5);
  }, []);

  const slots      = data.date ? generateTimeSlots() : [];
  const canReserve = !!data.date && !!data.time;

  const handleReserve = async () => {
    if (!canReserve) return;
    setIsLoading(true);
    // TODO: replace with real Supabase insert into bookings table
    await new Promise(r => setTimeout(r, 1400));
    setIsLoading(false);
    if (onConfirm) {
      onConfirm(data);
    } else {
      setConfirmed(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
              <span className="text-slate-400 font-normal ml-0.5">({reviewCount} avis)</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Confirmation instantanée
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> Populaire aujourd'hui
            </div>
          </div>
          {viewersCount > 0 && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="font-semibold text-slate-600">{viewersCount} personnes</span> consultent cette page
            </p>
          )}
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Date */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</p>
            <DatePicker
              selected={data.date}
              onChange={(date) => setData(prev => ({ ...prev, date, time: null }))}
            />
          </div>

          {/* Time slots — only after date selected */}
          {data.date && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heure</p>
              <TimeSlotGrid
                slots={slots}
                selected={data.time}
                onSelect={(time) => setData(prev => ({ ...prev, time }))}
              />
              {slots.some(s => s.spotsLeft !== undefined && s.spotsLeft > 0 && s.spotsLeft <= 3) && (
                <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Quelques créneaux limités — réservez vite !
                </p>
              )}
            </div>
          )}

          {/* Guests */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Invités</p>
            <GuestSelector
              value={data.guests}
              onChange={(guests) => setData(prev => ({ ...prev, guests }))}
            />
          </div>

          {/* Special request */}
          <div>
            <button
              type="button"
              onClick={() => setShowRequest(p => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Demande spéciale (optionnel)
              {showRequest
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
            {showRequest && (
              <textarea
                value={data.specialRequest}
                onChange={e => setData(prev => ({ ...prev, specialRequest: e.target.value }))}
                placeholder="Ex : anniversaire, table en terrasse, chaise bébé…"
                rows={3}
                className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
              />
            )}
          </div>

          {/* Summary */}
          {(data.date || data.time) && (
            <ReservationSummary data={data} fee={reservationFee} currency={currency} />
          )}

          {/* Reserve button */}
          <button
            type="button"
            onClick={handleReserve}
            disabled={!canReserve || isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              canReserve && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirmation en cours…
              </>
            ) : canReserve
              ? 'Réserver maintenant'
              : 'Choisissez une date et une heure'
            }
          </button>

          <p className="text-center text-xs text-slate-400">Aucun frais débité avant votre visite</p>
        </div>
      </div>

      {/* Inline confirmation modal (when no onConfirm prop) */}
      {confirmed && (
        <ReservationConfirmationModal
          data={data}
          onClose={() => setConfirmed(false)}
        />
      )}
    </>
  );
}