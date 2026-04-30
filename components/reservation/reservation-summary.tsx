'use client';

import { CalendarDays, Clock, Users, Receipt } from 'lucide-react';
import { ReservationData } from './types';

interface ReservationSummaryProps {
  data: ReservationData;
  fee: number;
  currency: string;
  price?: number;
}

const MONTH_SHORT = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

export function ReservationSummary({ data, fee, currency, price = 0 }: ReservationSummaryProps) {
  const formatDate = (d: Date) =>
    `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  const total = price > 0 ? price : fee * data.guests;

  const rows = [
    {
      icon: CalendarDays,
      label: 'Date',
      value: data.date ? formatDate(data.date) : '—',
      filled: !!data.date,
    },
    {
      icon: Clock,
      label: 'Heure',
      value: data.time ?? '—',
      filled: !!data.time,
    },
    {
      icon: Users,
      label: 'Invités',
      value: `${data.guests} ${data.guests === 1 ? 'personne' : 'personnes'}`,
      filled: true,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-slate-800">Résumé de la commande</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Business */}
        <div className="flex items-start justify-between text-sm">
          <span className="text-slate-500 font-medium">Établissement</span>
          <span className="text-slate-800 font-semibold text-right max-w-[160px] truncate">{data.businessName}</span>
        </div>

        {rows.map(({ icon: Icon, label, value, filled }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
            <span className={`font-semibold ${filled ? 'text-slate-800' : 'text-slate-300'}`}>
              {value}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{price > 0 ? 'Prix du service' : 'Frais'}</span>
            <span className="text-slate-700">{currency}{(price > 0 ? price : fee * data.guests).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-800">Total commande</span>
            <span className="text-blue-600 text-base">{currency}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}