'use client';

import ReservationHistoryCard from './ReservationHistoryCard';
import { CalendarDays, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UserReservationsListProps {
  bookings: any[];
}

export default function UserReservationsList({ bookings }: UserReservationsListProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {bookings && bookings.length > 0 ? (
        bookings.map((booking) => (
          <ReservationHistoryCard key={booking.id} booking={booking} />
        ))
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-gray-100 p-16 text-center shadow-sm"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-gray-100">
            <CalendarDays className="w-10 h-10 text-indigo-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Aucune réservation pour le moment</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Découvrez les meilleurs établissement de Tunisie et réservez votre prochain service en quelques secondes.
          </p>
          <button 
            onClick={() => router.push('/discover')}
            className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0"
          >
            Explorer Ro2ya
          </button>
        </motion.div>
      )}
    </div>
  );
}
