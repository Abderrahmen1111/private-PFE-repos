'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { QrCode, Clock, CheckCircle2, XCircle, Package, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderCardProps {
  id: string;
  order_number: string;
  businessName: string;
  businessImage?: string | null;
  status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  date: string;
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
  VALIDATED: { label: 'Accepted', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: QrCode },
  SHIPPED: { label: 'Shipped', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Package },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle },
};

export default function OrderCard({
  order_number,
  businessName,
  businessImage,
  status,
  total_price,
  date,
}: OrderCardProps) {
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const config = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const qrValue = `order_completion:${order_number}`;

  useEffect(() => {
    if (showQr && qrValue) {
      QRCode.toDataURL(qrValue, {
        width: 200,
        margin: 2,
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch((error) => {
          console.error('QR Code generation error:', error);
        });
    }
  }, [showQr, qrValue]);

  return (
    <motion.div 
      layout
      className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-50 shadow-sm transition-transform group-hover:scale-105 duration-300 flex-shrink-0">
              {businessImage ? (
                <Image
                  src={businessImage}
                  alt={businessName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                          <span class="text-white font-black text-sm">${businessName.charAt(0).toUpperCase()}</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{businessName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 line-clamp-1 tracking-tight">{businessName}</h4>
              <p className="text-xs font-bold text-gray-400">Order #{order_number}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border ${config.border} ${config.bg} ${config.color} transition-all duration-300 group-hover:shadow-sm`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-black tracking-widest">{config.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-gray-50 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-300 leading-none">Date</span>
            <span className="text-sm font-bold text-gray-700">{date}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-300 leading-none text-right">Amount</span>
            <span className="text-lg font-black text-indigo-600 tracking-tighter">{total_price.toLocaleString()} DT</span>
          </div>
        </div>

        {status === 'VALIDATED' && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!showQr ? (
                <motion.button
                  key="show-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowQr(true)}
                  className="w-full group/btn flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
                >
                  <QrCode className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                  Show Validation QR
                  <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </motion.button>
              ) : (
                <motion.div 
                  key="qr-reveal"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col items-center pt-2"
                >
                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col items-center w-full">
                  <div className="bg-white p-4 rounded-[2rem] shadow-2xl shadow-indigo-200/50 mb-5 flex items-center justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-sm text-gray-400">Generating QR...</span>
                      </div>
                    )}
                    </div>
                    <p className="text-xs text-center font-bold text-indigo-400 max-w-[200px] leading-relaxed mb-4">
                      Present this QR to the owner to confirm your order completion.
                    </p>
                    <button
                      onClick={() => setShowQr(false)}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest px-4 py-2"
                    >
                      Hide QR Code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
