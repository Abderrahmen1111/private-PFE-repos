'use client';

import { Phone, Clock, Shield, AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useActionDrawer } from '@/hooks/useActionDrawer';

interface Props {
  serviceId: number;
  serviceName: string;
  price: number;
  priceUnit: string;
  duration: string;
  storePhone: string;
  storeSlug: string;
  storeName?: string;
  businessRating?: number;
  businessReviews?: number;
  isVerified: boolean;
  isLinkedToStore?: boolean;
}

const UNIT_LABELS: Record<string, string> = {
  unit:    '/ intervention',
  hour:    '/ heure',
  day:     '/ jour',
  session: '/ séance',
};

export default function ServiceBookingCard({
  serviceId,
  serviceName,
  price,
  priceUnit,
  duration,
  storePhone,
  storeSlug,
  storeName = 'Boutique',
  businessRating = 4.5,
  businessReviews = 0,
  isVerified,
  isLinkedToStore = true,
}: Props) {
  const { openDrawer } = useActionDrawer();

  const handleReservationClick = () => {
    openDrawer('reservation', {
      businessId: String(serviceId),
      businessName: storeName,
      rating: businessRating,
      reviewCount: businessReviews,
      phone: storePhone,
      address: '',
      workingHours: null,
    });
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Price + button */}
      <div className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] p-5">
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-black text-[#0f172a]">
            {price === 0 ? 'Gratuit' : `${price} TND`}
          </span>
          {price > 0 && (
            <span className="text-[#64748b] text-sm mb-1">
              {UNIT_LABELS[priceUnit] ?? `/ ${priceUnit}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[#64748b] mb-5">
          <Clock className="w-4 h-4" /> Durée : {duration}
        </div>

        {/* This button shows only if linked/verified */}
        {isLinkedToStore ? (
          <button
            type="button"
            onClick={handleReservationClick}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            Réserver ce service
          </button>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700 leading-relaxed font-semibold">
              Réservation indisponible pour cet établissement en attente de vérification.
            </div>
          </div>
        )}

        <a
          href={`tel:${storePhone}`}
          className="w-full mt-2 py-2.5 rounded-xl font-bold text-sm border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> {storePhone}
        </a>
      </div>

      {/* Trust chips — always visible */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 space-y-2.5">
        {[
          { icon: Shield,        text: isVerified ? 'Prestataire vérifié' : 'Prestataire inscrit', color: isVerified ? 'text-blue-500' : 'text-[#64748b]' },
          { icon: AlertCircle,   text: 'Annulation gratuite 24h avant',                             color: 'text-emerald-500' },
          { icon: MessageCircle, text: 'Support client disponible',                                  color: 'text-violet-500' },
        ].map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-[#64748b]">
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            {text}
          </div>
        ))}
      </div>

      <Link
        href={`/merchants/business/${storeSlug}`}
        className="block w-full py-3 rounded-xl font-bold text-sm border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-all text-center"
      >
        Voir la boutique complète
      </Link>
    </div>
  );
}