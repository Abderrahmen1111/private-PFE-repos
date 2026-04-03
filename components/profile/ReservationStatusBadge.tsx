'use client';

import { CheckCircle2, Clock, XCircle, Check } from 'lucide-react';

interface Props {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function ReservationStatusBadge({ status }: Props) {
  const configs = {
    PENDING: {
      label: 'En attente',
      icon: Clock,
      classes: 'bg-amber-50 text-amber-600 border-amber-100/50 shadow-sm shadow-amber-100/20',
    },
    CONFIRMED: {
      label: 'Confirmée',
      icon: CheckCircle2,
      classes: 'bg-indigo-50 text-indigo-600 border-indigo-100/50 shadow-sm shadow-indigo-100/20',
    },
    COMPLETED: {
      label: 'Terminée',
      icon: Check,
      classes: 'bg-gray-50 text-gray-500 border-gray-100/50 shadow-sm shadow-gray-100/20',
    },
    CANCELLED: {
      label: 'Annulée',
      icon: XCircle,
      classes: 'bg-rose-50 text-rose-500 border-rose-100/50 shadow-sm shadow-rose-100/20',
    },
  };

  const { label, icon: Icon, classes } = configs[status] || configs.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
