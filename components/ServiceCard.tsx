'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/actions/items';
import { Star, Calendar, Clock, Award, ShieldCheck, Heart, ArrowRight, Zap, Package, ShoppingCart, Scale, ShoppingBag } from 'lucide-react';
import { useActionDrawer } from '@/hooks/useActionDrawer';
import { useCartStore } from '@/lib/store/use-cart-store';

interface ServiceCardProps {
    item: Item;
    businessName?: string;
    promotion?: {
        discount_percent?: number;
        discount_text?: string;
    };
    onBook?: () => void;
    onViewDetails?: () => void;
    hideBooking?: boolean;
    hidePricing?: boolean;
}

function Stars({ n }: { n: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-3 h-3 ${i <= n ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                />
            ))}
        </div>
    );
}

export function ServiceCard({ item, businessName, promotion, onBook, onViewDetails, hideBooking, hidePricing }: ServiceCardProps) {
    const { openDrawer } = useActionDrawer();
    const addItem = useCartStore((state) => state.addItem);
    const [isWished, setIsWished] = useState(false);

    const bName = businessName || (item as any).stores?.name || item.name;

    const handleOpenBooking = () => {
        if (onBook) {
            onBook();
        } else {
            // Check if ReservationSidebar exists on this page
            const reservationSidebar = document.getElementById('reservation-sidebar');
            if (reservationSidebar) {
                // On business page: dispatch event to open ReservationSidebar
                window.dispatchEvent(new CustomEvent('openReservationSidebar', { detail: { item } }));
                window.location.hash = 'reservation-sidebar';
            } else {
                // On search/other pages: open drawer directly
                const itemData = item as any;
                openDrawer('reservation', {
                    businessId: itemData.store_id || itemData.id,
                    storeId: itemData.store_id || itemData.id,
                    service: itemData,
                    businessName: bName,
                    rating: itemData.rating_average || 4.5,
                    reviewCount: itemData.total_reviews || 12,
                    phone: itemData.stores?.phone,
                    address: itemData.stores?.address || 'Tunisie',
                    workingHours: itemData.stores?.working_hours,
                    ownerId: itemData.stores?.owner_id,
                });
            }
        }
    };

    const hasDiscount = !!promotion?.discount_percent;
    const price = item.price || 0;
    const discountedPrice = hasDiscount
        ? price * (1 - (promotion.discount_percent! / 100))
        : price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem({
            id: item.id.toString(),
            name: item.name,
            price: item.price,
            discountedPrice: hasDiscount ? discountedPrice : undefined,
            image: item.main_image,
            quantity: 1,
            store_id: item.store_id?.toString() || '',
            store_name: bName,
            item_type: item.item_type as 'PRODUCT' | 'SERVICE',
            owner_id: (item as any).stores?.owner_id,
        });
    };

    return (
        <div
            onClick={onViewDetails}
            className="group relative bg-[#1c1c1c] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#2a2a2a] hover:border-[#3a3a3a] hover:-translate-y-1 cursor-pointer h-full flex flex-col"
        >
            {/* Image/Visual Section */}
            <div className="relative h-[220px] bg-[#111] flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111]">
                        <span className="text-7xl select-none opacity-20 filter drop-shadow-lg">
                            ✨
                        </span>
                    </div>
                )}

                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWished(!isWished);
                    }}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                        isWished ? 'bg-black/50 text-rose-500 scale-110' : 'bg-black/40 text-white hover:text-rose-400'
                    } backdrop-blur-md`}
                >
                    <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                </button>

                {/* Floating Badges (Discount Bottom Right like Image) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {hasDiscount && (
                        <div className="px-2.5 py-1 rounded-md bg-[#1ed760] text-black font-bold text-[11px] tracking-wide shadow-lg">
                            {promotion.discount_percent}% OFF
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[17px] font-semibold text-white leading-snug line-clamp-2">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 shrink-0">
                        <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-semibold text-zinc-300">
                            {item.rating_average ? item.rating_average.toFixed(1) : '4.7'}
                        </span>
                    </div>
                </div>

                <div className="text-[14px] text-zinc-400 line-clamp-1">
                    {businessName ? `By ${businessName}` : 'Service Professionnel'}
                </div>

                {!hidePricing && (
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[22px] font-bold text-white tracking-tight">
                            {discountedPrice.toLocaleString()} DT
                        </span>
                        {hasDiscount && (
                            <span className="text-sm font-medium text-zinc-500 line-through">
                                {item.price.toLocaleString()} DT
                            </span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-3 mt-auto">
                    {!hideBooking && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBooking();
                            }}
                            className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-bold tracking-wide uppercase bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors active:scale-95"
                        >
                            <Calendar className="w-4 h-4" />
                            Réserver
                        </button>
                    )}

                    {!hideBooking && (
                        <button
                            onClick={handleAddToCart}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#3a3a3a] transition-all active:scale-95"
                            title="Ajouter au panier"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.();
                        }}
                        className={`${hideBooking ? 'flex-1 h-10' : 'w-10 h-10'} flex items-center justify-center rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#3a3a3a] transition-all active:scale-95`}
                        title="Détails"
                    >
                        {hideBooking && <span className="mr-2 text-xs font-bold tracking-wide uppercase">Détails</span>}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
