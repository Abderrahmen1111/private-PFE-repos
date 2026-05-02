'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Globe, MapPin, Clock, MessageCircle, X, Loader2 } from 'lucide-react';
import { ReservationCard } from '@/components/reservation/reservation-card';
import { logStoreAnalyticsEvent } from '@/lib/actions/user-activity';
import { ReservationConfirmationModal } from '@/components/reservation/reservation-confirmation-modal';
import { ReservationData } from '@/components/reservation/types';
import { Item } from '@/lib/actions/items';
import BusinessCommandSidebar from './BusinessCommandSidebar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface WorkingHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface Props {
  businessId: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  phone?: string | null;
  website?: string | null;
  address: string;
  workingHours: Record<string, WorkingHours> | null;
  isLinkedToStore?: boolean;
  hasProducts?: boolean;
  items?: Item[];
  isOwner?: boolean;
  ownerId?: string | null;
  storeId?: number | null;
}

export function BusinessReservationSidebar({
  businessId,
  businessName,
  rating,
  reviewCount,
  phone,
  website,
  address,
  workingHours,
  isLinkedToStore = true,
  hasProducts = false,
  items = [],
  isOwner = false,
  ownerId,
  storeId
}: Props) {
  const [showReservation, setShowReservation] = useState(false);
  const [confirmedData, setConfirmedData] = useState<ReservationData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#reservation') {
        setShowReservation(true);
        setTimeout(() => {
          document.getElementById('reservation-sidebar')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for event to open sidebar from ServiceCard
  useEffect(() => {
    const handleOpenReservation = () => {
      setShowReservation(true);
      setTimeout(() => {
        document.getElementById('reservation-sidebar')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    window.addEventListener('openReservationSidebar', handleOpenReservation);
    return () => window.removeEventListener('openReservationSidebar', handleOpenReservation);
  }, []);

  return (
    <>
      <div id="reservation-sidebar" className="sticky top-24 space-y-4 scroll-mt-24">

        {/* ── Info card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-gray-900 font-bold text-xl mb-6">Informations</h3>

          <div className="space-y-5">
            {/* Phone */}
            {phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Téléphone</p>
                  <a 
                    href={`tel:${phone}`} 
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => storeId && logStoreAnalyticsEvent(storeId, 'phone_click', crypto.randomUUID())}
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Site Web</p>
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                    {website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Adresse</p>
                <p className="text-gray-700 text-sm">{address}</p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-1 text-blue-600 text-sm font-semibold hover:underline inline-block"
                  onClick={() => storeId && logStoreAnalyticsEvent(storeId, 'direction_click', crypto.randomUUID())}
                >
                  Itinéraire
                </a>
              </div>
            </div>

            {/* Working Hours */}
            {workingHours && (
              <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Horaires d'ouverture</p>
                  <div className="space-y-1.5">
                    {Object.entries(workingHours).map(([day, hours]) => {
                      const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                      return (
                        <div key={day} className={`flex justify-between text-sm ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                          <span className="capitalize">{day}</span>
                          <span>{hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Action buttons ────────────────────────────────────────────── */}
          {!isOwner ? (
            <div className="mt-8 space-y-3">
              {ownerId && (
                <Button 
                  asChild
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] h-auto"
                >
                  <Link href={`/messages?storeId=${storeId}&type=store`}>
                    <MessageCircle className="w-4 h-4" />
                    Envoyer un message
                  </Link>
                </Button>
              )}

              {isLinkedToStore && (
                <button
                  type="button"
                  onClick={() => {
                    setShowReservation(!showReservation);
                  }}
                  className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border-2 active:scale-[0.98] ${
                    showReservation
                      ? 'bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {showReservation ? <><X className="w-4 h-4" /> Fermer</> : 'Réserver'}
                </button>
              )}

              {hasProducts && (
                <BusinessCommandSidebar
                  businessName={businessName}
                  items={items}
                  storeId={items[0]?.store_id ?? undefined}
                  isLinkedToStore={isLinkedToStore}
                />
              )}
            </div>
          ) : (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-blue-700 text-sm font-medium text-center">
                Vous visualisez votre propre établissement.
              </p>
            </div>
          )}
        </div>

        {/* ── Reservation card (slides in below) ────────────────────────── */}
        {showReservation && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <ReservationCard
              businessId={businessId}
              businessName={businessName}
              rating={rating}
              reviewCount={reviewCount}
              reservationFee={0}
              currency="TND "
              service={items.find(i => i.item_type === 'SERVICE')}
              storeId={items[0]?.store_id ?? undefined}
              workingHours={workingHours}
              onConfirm={(data: ReservationData) => {
                setConfirmedData(data);
                setShowReservation(false);
              }}
            />
          </div>
        )}
      </div>

      {/* ── Confirmation modal ─────────────────────────────────────────────── */}
      {confirmedData && (
        <ReservationConfirmationModal
          data={confirmedData}
          onClose={() => setConfirmedData(null)}
        />
      )}
    </>
  );
}