'use client';

import { useState } from 'react';
import { Phone, Clock, Shield, AlertCircle, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { ReservationCard } from '@/components/reservation/reservation-card';
import { ReservationConfirmationModal } from '@/components/reservation/reservation-confirmation-modal';
import { ReservationData } from '@/components/reservation/types';

interface Props {
  serviceId: number;
  serviceName: string;
  price: number;
  priceUnit: string;
  duration: string;
  storePhone: string;
  storeSlug: string;
  isVerified: boolean;
  businessRating?: number;
  businessReviews?: number;
  // removed isBookable — button always shows
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
  isVerified,
  businessRating = 4.5,
  businessReviews = 0,
}: Props) {
  const [showReservation, setShowReservation] = useState(false);
  const [confirmedData,   setConfirmedData]   = useState<ReservationData | null>(null);

  return (
    <>
      <div className="sticky top-24 space-y-4">

        {/* Price + toggle button */}
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

          {/* This button always renders — isBookable removed */}
          <button
            type="button"
            onClick={() => setShowReservation(p => !p)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              showReservation
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
            }`}
          >
            {showReservation
              ? <><X className="w-4 h-4" /> Fermer la réservation</>
              : 'Réserver ce service'
            }
          </button>

          <a
            href={`tel:${storePhone}`}
            className="w-full mt-2 py-2.5 rounded-xl font-bold text-sm border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" /> {storePhone}
          </a>
        </div>

        {/* Reservation card slides in */}
        {showReservation && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <ReservationCard
              businessId={String(serviceId)}
              businessName={serviceName}
              rating={businessRating}
              reviewCount={businessReviews}
              reservationFee={price}
              currency="TND "
              onConfirm={(data: ReservationData) => {
                setConfirmedData(data);
                setShowReservation(false);
              }}
            />
          </div>
        )}

        {/* Trust chips — hidden while reservation card is open */}
        {!showReservation && (
          <>
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
          </>
        )}
      </div>

      {/* Confirmation modal after booking */}
      {confirmedData && (
        <ReservationConfirmationModal
          data={confirmedData}
          onClose={() => setConfirmedData(null)}
        />
      )}
    </>
  );
}