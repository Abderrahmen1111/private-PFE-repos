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
                });
            }
        }
    };

    const hasDiscount = !!promotion?.discount_percent;
    const discountedPrice = hasDiscount
        ? item.price * (1 - (promotion.discount_percent! / 100))
        : item.price;

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
        });
    };

    return (
        <div
            onClick={onViewDetails}
            className="group relative bg-white rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden border border-indigo-100/30 hover:border-indigo-200 hover:-translate-y-2 cursor-pointer h-full flex flex-col"
        >
            {/* Image/Visual Section */}
            <div className="relative h-56 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                        <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-700 opacity-20">
                            ✨
                        </span>
                    </div>
                )}

                {/* Floating Badges (Premium) */}
                <div className="absolute top-5 left-5 flex flex-col gap-2.5">
                    {hasDiscount && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-white/20 text-white shadow-2xl animate-pulse">
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span className="text-[11px] font-black tracking-widest uppercase">-{promotion.discount_percent}%</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-xl text-indigo-600">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-[0.1em] uppercase">Expert</span>
                    </div>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWished(!isWished);
                    }}
                    className={`absolute top-5 right-5 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
                        isWished ? 'bg-rose-500 text-white shadow-xl scale-110' : 'bg-white/80 text-stone-400 hover:text-rose-500 hover:scale-105'
                    } shadow-lg backdrop-blur-xl border border-white/20`}
                >
                    <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                </button>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-5 left-5 right-5">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600/90 backdrop-blur-xl text-white text-[10px] font-black tracking-widest uppercase shadow-2xl border border-white/10">
                        Service Professionnel
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="space-y-1">
                    <h3 className="text-[18px] font-black text-stone-900 leading-[1.3] line-clamp-2 h-11 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    {!hidePricing ? (
                        <div className="flex flex-col">
                            {hasDiscount && (
                                <span className="text-[11px] font-bold text-rose-500/50 line-through tracking-wider">
                                    {item.price.toLocaleString()} DT
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black tracking-tighter ${hasDiscount ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    {discountedPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black border border-indigo-100 px-1.5 py-0.5 rounded-md text-indigo-400 uppercase ml-1">
                                    DT
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-20">
                            {/* Empty space to keep layout intact when pricing is hidden */}
                        </div>
                    )}

                    <div className="flex flex-col items-end gap-1">
                         <Stars n={item.rating_average || 0} />
                         <span className="text-[10px] font-bold text-stone-300 tracking-tighter">
                            ({(item.total_reviews || 0).toLocaleString()} avis)
                        </span>
                    </div>
                </div>

                {businessName && (
                    <div className="flex items-center gap-3 py-3 border-y border-stone-100/50">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-sm border border-indigo-100 shadow-inner">
                            🏪
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-stone-400 uppercase tracking-[0.1em]">{businessName}</span>
                            <span className="text-[10px] font-bold text-indigo-400">Établissement vérifié</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 text-indigo-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Flexibilité</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Garanti</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-4">
                    {!hideBooking && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBooking();
                            }}
                            className="flex-1 overflow-hidden relative group/btn h-12 flex items-center justify-center gap-2.5 text-[13px] font-black tracking-widest uppercase bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-[0_10px_20px_rgba(79,70,229,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                            <Calendar className="w-4.5 h-4.5" />
                            Réserver
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                        </button>
                    )}

                        <button
                            onClick={handleAddToCart}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-stone-100 text-stone-300 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 active:scale-95 shadow-sm"
                            title="Ajouter au panier"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.();
                            }}
                            className={`${hideBooking ? 'flex-1 h-12' : 'w-12 h-12'} flex items-center justify-center rounded-2xl bg-white border border-stone-100 text-stone-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 active:scale-95 shadow-sm`}
                            title="Détails"
                        >
                            {hideBooking && <span className="mr-2 text-[13px] font-black tracking-widest uppercase text-stone-400">Détails</span>}
                            <Clock className="w-5 h-5" />
                        </button>
                </div>
            </div>
            
            {/* Premium Shine Effect on hover */}
            <div className="absolute -inset-full h-[500%] w-[500%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2s] pointer-events-none" />
        </div>
    );
}
