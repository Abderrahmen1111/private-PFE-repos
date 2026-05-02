'use client';

import { Phone, Globe, MapPin, Clock, MessageCircle, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ReservationCard } from '@/components/reservation/reservation-card';
import { ReservationData } from '@/components/reservation/types';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserBookings } from '@/lib/actions/reservation';
import ReservationHistoryCard from '@/components/profile/ReservationHistoryCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkingHours {
  open: string;
  close: string;
  closed: boolean;
}

interface Props {
  businessId: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  phone?: string | null;
  website?: string | null;
  address: string;
  workingHours: Record<string, WorkingHours> | null;
  service?: any;
  storeId?: number;
  ownerId?: string | null;
  onConfirm?: (data: ReservationData) => void;
}

export function ReservationDrawerContent({
  businessId,
  businessName,
  rating,
  reviewCount,
  phone,
  website,
  address,
  workingHours,
  service,
  storeId,
  ownerId,
  onConfirm,
}: Props) {
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const bookings = await getUserBookings(user.id);
        const businessBookings = bookings.filter((b: any) => b.store_id.toString() === businessId.toString() && (b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'VALIDATED'));
        setActiveBookings(businessBookings);
      }
    };
    loadData();
  }, [businessId]);

  return (
    <div className="space-y-8 pb-20">
      {/* Existing Reservations Section */}
      {activeBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-black uppercase tracking-tight">Vos réservations en cours</h4>
          </div>
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="scale-[0.9] origin-top -mb-10">
                <ReservationHistoryCard booking={booking} />
              </div>
            ))}
          </div>
          <div className="h-px bg-stone-100 my-8" />
        </div>
      )}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h3 className="text-gray-900 font-bold text-xl mb-4">Informations</h3>
        <div className="space-y-4">
          {phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Téléphone</p>
                <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-sm">{phone}</a>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Adresse</p>
              <p className="text-gray-700 text-sm">{address}</p>
            </div>
          </div>
          {workingHours && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-50">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-semibold text-gray-900 mb-1">Horaires d'ouverture</p>
                <div className="space-y-1">
                  {Object.entries(workingHours).map(([day, hours]) => {
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                    return (
                      <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
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
      </div>

      <ReservationCard
        businessId={businessId}
        businessName={businessName}
        rating={rating}
        reviewCount={reviewCount}
        reservationFee={0}
        currency="TND "
        service={service}
        storeId={storeId}
        workingHours={workingHours}
        onConfirm={onConfirm}
      />
      
      {ownerId && (
        <Button 
          asChild
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] h-auto"
        >
          <Link href={`/messages?partnerId=${ownerId}&type=store&storeId=${storeId}`}>
            <MessageCircle className="w-4 h-4" />
            Envoyer un message
          </Link>
        </Button>
      )}
    </div>
  );
}
