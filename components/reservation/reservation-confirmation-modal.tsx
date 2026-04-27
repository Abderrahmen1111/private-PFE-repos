'use client';

import { useEffect } from 'react';
import { X, CalendarDays, Clock, Users, CheckCircle2, CalendarPlus, ArrowRight } from 'lucide-react';
import { ReservationData } from './types';
import { useRouter } from 'next/navigation';

interface ConfirmationModalProps {
  data: ReservationData;
  onClose: () => void;
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ReservationConfirmationModal({ data, onClose }: ConfirmationModalProps) {
  const router = useRouter();
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const formatDate = (d: Date) =>
    `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  const handleAddToCalendar = () => {
    if (!data.date || !data.time) return;
    const [h, m] = data.time.split(':').map(Number);
    const start = new Date(data.date);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 90 * 60 * 1000); // +90 min

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE`
      + `&text=${encodeURIComponent(`Reservation at ${data.businessName}`)}`
      + `&dates=${fmt(start)}/${fmt(end)}`
      + `&details=${encodeURIComponent(data.specialRequest || 'Reservation via Ro2ya')}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
      >
        <style>{`
          @keyframes modalPop {
            from { opacity:0; transform:scale(0.9) translateY(16px); }
            to   { opacity:1; transform:scale(1)   translateY(0); }
          }
        `}</style>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success header */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 px-6 pt-8 pb-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Réservation Confirmée ! 🎉</h2>
          <p className="text-sm text-slate-500">Votre place a été réservée avec succès.</p>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Détails de la réservation</p>
            <p className="font-bold text-slate-800 text-base mb-3">{data.businessName}</p>

            <div className="space-y-2">
              {data.date && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{formatDate(data.date)}</span>
                </div>
              )}
              {data.time && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{data.time}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {data.guests} {data.guests === 1 ? 'invité' : 'invités'}
                </span>
              </div>
            </div>
          </div>

          {/* Reference number */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="text-xs text-blue-600 font-medium">N° de confirmation</span>
            <span className="text-xs font-bold text-blue-700 font-mono">
              RO2-{Math.random().toString(36).slice(2,8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={handleAddToCalendar}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-200 active:scale-[0.98]"
          >
            <CalendarPlus className="w-4 h-4" />
            Ajouter au calendrier Google
          </button>
          <button
            onClick={() => router.push('/profile/user?tab=reservations')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            Voir mes réservations
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}