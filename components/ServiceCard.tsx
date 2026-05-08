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
            className="group relative bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.12)] transition-all duration-500 overflow-hidden border border-stone-200/60 hover:border-indigo-300 hover:-translate-y-1.5 cursor-pointer h-full flex flex-col"
        >
            {/* Image/Visual Section */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl select-none group-hover:scale-125 transition-transform duration-700 opacity-20 filter drop-shadow-lg">
                            ✨
                        </span>
                    </div>
                )}

                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                {/* Floating Badges (Premium) */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {hasDiscount && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 backdrop-blur-md text-white shadow-lg animate-pulse">
                            <Zap className="w-3 h-3 fill-white" />
                            <span className="text-[10px] font-black tracking-widest uppercase">-{promotion.discount_percent}%</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm text-indigo-700 border border-white/20">
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Expert</span>
                    </div>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWished(!isWished);
                    }}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                        isWished ? 'bg-rose-500 text-white shadow-md scale-110' : 'bg-white/90 text-stone-400 hover:text-rose-500 hover:scale-105'
                    } shadow-sm backdrop-blur-md`}
                >
                    <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                </button>

                {/* Bottom Overlay Label (Overlapping Image & Content) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                     <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-900 text-white text-[9px] font-black tracking-[0.15em] uppercase shadow-xl border border-indigo-500/30 whitespace-nowrap">
                        Service Professionnel
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 pt-8 flex flex-col flex-1 gap-4">
                <div className="space-y-1 text-center mt-1">
                    <h3 className="text-[17px] font-black text-stone-900 leading-tight line-clamp-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.name}
                    </h3>
                </div>

                <div className="flex items-center justify-center mt-1">
                    <div className="flex flex-col items-center gap-1.5">
                         <Stars n={item.rating_average || 0} />
                         <span className="text-[10px] font-bold text-stone-400 tracking-wider">
                            ({(item.total_reviews || 0).toLocaleString()} avis)
                        </span>
                    </div>
                </div>

                {!hidePricing && (
                    <div className="flex items-center justify-center mt-2 bg-stone-50 rounded-xl py-2 border border-stone-100">
                        <div className="flex flex-col items-center">
                            {hasDiscount && (
                                <span className="text-[11px] font-bold text-rose-400 line-through tracking-wider">
                                    {item.price.toLocaleString()} DT
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black tracking-tighter ${hasDiscount ? 'text-rose-600' : 'text-stone-900'}`}>
                                    {discountedPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black text-stone-400 uppercase ml-0.5">
                                    DT
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {businessName && (
                    <div className="flex items-center justify-center gap-2 py-3 mt-auto border-t border-stone-100">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm border border-stone-200">
                            🏪
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest truncate max-w-[120px]">{businessName}</span>
                            <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Vérifié
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex justify-center flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Flexibilité</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Garanti</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    {!hideBooking && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBooking();
                            }}
                            className="flex-1 h-11 flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase bg-stone-900 text-white rounded-xl hover:bg-indigo-600 transition-colors active:scale-95 shadow-md"
                        >
                            <Calendar className="w-4 h-4" />
                            Réserver
                        </button>
                    )}

                        {!hideBooking && (
                            <button
                                onClick={handleAddToCart}
                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 active:scale-95 shadow-sm"
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
                            className={`${hideBooking ? 'flex-1 h-11' : 'w-11 h-11'} flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 active:scale-95 shadow-sm`}
                            title="Détails"
                        >
                            {hideBooking && <span className="mr-2 text-[11px] font-black tracking-[0.2em] uppercase text-stone-600">Détails</span>}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                </div>
            </div>
            
            {/* Premium Shine Effect on hover */}
            <div className="absolute -inset-full h-[500%] w-[500%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2s] pointer-events-none" />
        </div>
    );
}
