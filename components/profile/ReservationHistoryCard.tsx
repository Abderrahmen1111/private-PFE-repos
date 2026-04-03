'use client';

import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationStatusBadge from './ReservationStatusBadge';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Props {
  booking: any;
}

export default function ReservationHistoryCard({ booking }: Props) {
  const {
    booking_number,
    booking_date,
    start_time,
    duration_minutes,
    price,
    status,
    stores,
    items,
  } = booking;

  const dateStr = format(parseISO(booking_date), 'EEEE d MMMM yyyy', { locale: fr });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const isConfirmed = ['CONFIRMED', 'VALIDATED'].includes(status?.toUpperCase());

  useEffect(() => {
    if (isModalOpen && booking_number) {
      QRCode.toDataURL(booking_number, {
        width: 300,
        margin: 1,
        color: {
          dark: '#312e81', // indigo-900
          light: '#ffffff'
        }
      }).then(url => setQrCodeDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [isModalOpen, booking_number]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm transition-all group ${isConfirmed ? 'cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10' : 'hover:shadow-xl hover:shadow-indigo-500/5'}`}
      onClick={() => {
        if (isConfirmed) setIsModalOpen(true);
      }}
    >
      <div className="flex flex-col md:flex-row">
        
        {/* Business Info Section */}
        <div className="p-8 flex-1 flex gap-6 border-b md:border-b-0 md:border-r border-gray-50/50">
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
            {stores?.logo_url ? (
              <Image 
                src={stores.logo_url} 
                alt={stores.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase italic">
                {stores?.name?.charAt(0) || 'B'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-black text-gray-900 truncate tracking-tight text-lg uppercase tracking-tighter">{stores?.name}</h4>
              <ReservationStatusBadge status={status} />
            </div>
            <p className="text-sm font-black text-indigo-600 mb-3 truncate uppercase tracking-widest opacity-80">
              {items?.name || 'Service'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black tracking-widest bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100">#{booking_number}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ring-1 ring-gray-100 px-3 py-1 rounded-full">
                 {duration_minutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Price Section */}
        <div className="p-8 bg-gray-50/30 md:w-72 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-indigo-500/50" />
              <span className="truncate">{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <Clock className="w-4 h-4 text-indigo-500/50" />
              <span>{start_time}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-2xl font-black text-gray-900 tracking-tighter">
              {price.toFixed(2)} <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TND</span>
            </p>
            <button className="p-3.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-indigo-500/10">
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert if pending */}
      {status === 'PENDING' && (
        <div className="px-8 py-3 bg-indigo-50/30 border-t border-indigo-100/20 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-[9px] font-black text-indigo-600/60 uppercase tracking-[0.2em]">
            En attente de confirmation par l'établissement
          </p>
        </div>
      )}

      {/* QR Code Modal for Merchant Scanning */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-black text-center text-2xl tracking-tight">Présentez ce code</DialogTitle>
            <DialogDescription className="text-gray-500 text-center font-medium mt-2">
              Le commerçant scannera ce code pour valider votre prestation de <strong className="text-gray-900">{items?.name || 'Service'}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center space-y-8 mt-4">
            <div className="p-4 bg-white rounded-[2rem] shadow-sm border border-gray-100 ring-8 ring-indigo-50/50">
              {qrCodeDataUrl ? (
                <Image src={qrCodeDataUrl} alt="QR Code" width={250} height={250} className="rounded-xl mix-blend-multiply" />
              ) : (
                <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-50 rounded-[1.5rem]">
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              )}
            </div>
            <div className="text-center w-full px-4">
              <div className="bg-indigo-50 text-indigo-600 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-inner w-full">
                {booking_number}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
