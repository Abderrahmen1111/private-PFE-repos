'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck, ShoppingCart } from 'lucide-react';
import { useActionDrawer } from '@/hooks/useActionDrawer';
import { ReservationDrawerContent } from './reservation/ReservationDrawerContent';
import { CheckoutDrawerContent } from './checkout/CheckoutDrawerContent';

export default function GlobalActionDrawer() {
  const { isOpen, mode, data, closeDrawer } = useActionDrawer();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] lg:w-[500px] bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  mode === 'reservation' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {mode === 'reservation' ? <CalendarCheck className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 leading-none">
                    {mode === 'reservation' ? 'Réservations' : 'Confirmer l\'Achat'}
                  </h2>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                    {mode === 'reservation' ? 'Vérifier la disponibilité' : 'Finaliser votre commande'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all border border-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {mode === 'reservation' && (
                <ReservationDrawerContent
                  businessId={data.businessId}
                  businessName={data.businessName}
                  rating={data.rating || 4.8}
                  reviewCount={data.reviewCount || 10}
                  phone={data.phone}
                  website={data.website}
                  address={data.address}
                  workingHours={data.workingHours}
                  onConfirm={(resData) => {
                    console.log('Reservation confirmed:', resData);
                    // maybe close or show success
                  }}
                />
              )}
              {mode === 'checkout' && (
                <CheckoutDrawerContent
                  item={data.item}
                  businessName={data.businessName}
                  storeId={data.storeId}
                  promotion={data.promotion}
                  onConfirm={(orderData) => {
                    console.log('Order confirmed:', orderData);
                    // maybe close or show success
                  }}
                />
              )}
            </div>

            {/* Sticky Bottom Actions (if any needed outside content) */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
