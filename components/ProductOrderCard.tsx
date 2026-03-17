'use client';

import { useState } from 'react';
import { Phone, ShoppingCart, CheckCircle, Shield, AlertCircle, Package, Minus, Plus, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface Props {
  productId: number;
  productName: string;
  price: number;
  priceUnit: string;
  stockQuantity: number;
  status: string;
  storePhone: string;
  storeSlug: string;
  isVerified: boolean;
}

const UNIT_LABELS: Record<string, string> = {
  unit:    '/ pièce',
  hour:    '/ heure',
  day:     '/ jour',
  session: '/ séance',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE:    { label: 'En stock',        color: 'text-green-600 bg-green-50' },
  OUT_OF_STOCK: { label: 'Rupture de stock', color: 'text-red-600 bg-red-50' },
  ON_DEMAND:    { label: 'Sur commande',     color: 'text-orange-600 bg-orange-50' },
};

export default function ProductOrderCard({
  productId, productName, price, priceUnit,
  stockQuantity, status, storePhone, storeSlug, isVerified,
}: Props) {
  const [quantity,  setQuantity]  = useState(1);
  const [ordered,   setOrdered]   = useState(false);

  const isAvailable    = status === 'AVAILABLE';
  const isOnDemand     = status === 'ON_DEMAND';
  const canOrder       = isAvailable || isOnDemand;
  const statusInfo     = STATUS_LABELS[status] ?? STATUS_LABELS.AVAILABLE;
  const totalPrice     = (price * quantity).toFixed(3);

  return (
    <div className="sticky top-24 space-y-4">

      {/* Price + order card */}
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5">

        {/* Price */}
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-black text-stone-900">
            {price === 0 ? 'Gratuit' : `${price} TND`}
          </span>
          {price > 0 && (
            <span className="text-stone-400 text-sm mb-1">
              {UNIT_LABELS[priceUnit] ?? `/ ${priceUnit}`}
            </span>
          )}
        </div>

        {/* Status badge */}
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-4 ${statusInfo.color}`}>
          {statusInfo.label}
          {isAvailable && stockQuantity > 0 && stockQuantity <= 10 && (
            <span className="ml-1 opacity-70">({stockQuantity} restants)</span>
          )}
        </span>

        {/* Quantity selector */}
        {canOrder && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold text-stone-600">Quantité</span>
            <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-stone-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => isAvailable && stockQuantity > 0 ? Math.min(stockQuantity, q + 1) : q + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-stone-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {price > 0 && quantity > 1 && (
              <span className="text-sm font-bold text-red-600 ml-auto">{totalPrice} TND</span>
            )}
          </div>
        )}

        {/* CTA */}
        {canOrder ? (
          <button
            onClick={() => setOrdered(true)}
            disabled={ordered}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              ordered
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {ordered ? (
              <><CheckCircle className="w-4 h-4" /> Commande envoyée !</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Commander</>
            )}
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl bg-stone-100 text-stone-400 text-sm font-bold text-center cursor-not-allowed">
            Produit indisponible
          </div>
        )}

        <a
          href={`tel:${storePhone}`}
          className="w-full mt-2 py-3 rounded-xl font-bold text-sm border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> {storePhone}
        </a>
      </div>

      {/* Trust chips */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 space-y-2.5">
        {[
          { icon: Shield,    text: isVerified ? 'Boutique vérifiée' : 'Boutique inscrite', color: isVerified ? 'text-blue-500' : 'text-stone-400' },
          { icon: Package,   text: 'Livraison disponible sur demande',                      color: 'text-green-500' },
          { icon: AlertCircle, text: 'Retours acceptés sous 7 jours',                       color: 'text-orange-500' },
          { icon: BadgeCheck,  text: 'Paiement sécurisé',                                  color: 'text-violet-500' },
        ].map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            {text}
          </div>
        ))}
      </div>

      {/* View store */}
      <Link
        href={`/merchants/business/${storeSlug}`}
        className="block w-full py-3 rounded-xl font-bold text-sm border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all text-center"
      >
        Voir la boutique complète
      </Link>

    </div>
  );
}