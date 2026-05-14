'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/actions/items';
import { Star, Package, ShoppingCart, Scale, Heart, Zap, Calendar, ShoppingBag } from 'lucide-react';
import { useActionDrawer } from '@/hooks/useActionDrawer';
import { useCartStore } from '@/lib/store/use-cart-store';
import { useTracking } from '@/hooks/useTracking';

interface ServiceCardProps {
    item: Item;
    businessName?: string;
    promotion?: {
        discount_percent?: number;
        discount_text?: string;
    };
    onBook?: () => void;
    onViewDetails?: () => void;
}

interface ProductCardProps {
    item: Item;
    businessName?: string;
    compared?: boolean;
    promotion?: {
        discount_percent?: number;
        discount_text?: string;
    };
    onCompare?: () => void;
    onViewDetails?: () => void;
    onBuy?: () => void;
    hideBuyButton?: boolean;
    isOwner?: boolean;
}

const categoryStyles: Record<string, { icon: string; color: string; tag: string }> = {
    clothing: { icon: '👗', color: 'from-violet-50 to-indigo-50 text-indigo-700 border-indigo-100', tag: 'Mode & Style' },
    accessories: { icon: '💍', color: 'from-emerald-50 to-teal-50 text-teal-700 border-teal-100', tag: 'Accessoires Premium' },
    food: { icon: '🍽️', color: 'from-amber-50 to-orange-50 text-orange-700 border-orange-100', tag: 'Gastronomie' },
    beverages: { icon: '🥤', color: 'from-sky-50 to-blue-50 text-blue-700 border-blue-100', tag: 'Rafraîchissements' },
    furniture: { icon: '🪑', color: 'from-rose-50 to-pink-50 text-rose-700 border-rose-100', tag: 'Ameublement' },
    furniture_v2: { icon: '🛋️', color: 'from-orange-50 to-amber-50 text-amber-700 border-amber-100', tag: 'Décoration' }, // Added variation
    electronics: { icon: '💻', color: 'from-purple-50 to-violet-50 text-purple-700 border-purple-100', tag: 'High-Tech' },
    services: { icon: '✨', color: 'from-blue-50 to-cyan-50 text-cyan-700 border-cyan-100', tag: 'Service Professionnel' },
    other: { icon: '📦', color: 'from-gray-50 to-slate-50 text-slate-700 border-slate-100', tag: 'Offre Spéciale' },
};

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

export function ProductCard({ item, businessName, compared, promotion, onCompare, onViewDetails, onBuy, hideBuyButton, isOwner = false }: ProductCardProps) {
    const { openDrawer } = useActionDrawer();
    const [isWished, setIsWished] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const { trackLike, trackUnlike, trackClick, trackBookingStart } = useTracking();
    
    const bName = businessName || (item as any).stores?.name || 'Commerce';
    const merchantId = item.store_id?.toString();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const bName = businessName || (item as any).stores?.name || 'Commerce';
        const hasDiscount = !!promotion?.discount_percent;
        const discountedPrice = hasDiscount
            ? item.price * (1 - (promotion.discount_percent! / 100))
            : item.price;

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
        
        // Optional: show feedback
        // alert('Ajouté au panier !');
    };

    const handleOpenBuy = () => {
        // Track the booking/buy intent immediately
        trackBookingStart(item.id.toString(), merchantId || '');

        if (onBuy) {
            onBuy();
        } else {
            const commandSidebar = document.getElementById('command-sidebar');
            if (commandSidebar) {
                window.dispatchEvent(new CustomEvent('openCommandSidebar', { detail: { item, businessName: bName } }));
                window.location.hash = 'command-sidebar';
            } else {
                openDrawer('checkout', {
                    item,
                    businessName: bName,
                    promotion,
                    isOwner,
                });
            }
        }
    };
    const typeKey = item.item_type === 'SERVICE' ? 'services' : 'other';
    const style = categoryStyles[typeKey] || categoryStyles.other;

    const hasDiscount = !!promotion?.discount_percent;
    const discountedPrice = hasDiscount
        ? item.price * (1 - (promotion.discount_percent! / 100))
        : item.price;

    return (
        <div
            onClick={() => {
                trackClick('home', item.id.toString(), 0, merchantId);
                onViewDetails?.();
            }}
            className="group relative bg-[#1c1c1c] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#2a2a2a] hover:border-[#3a3a3a] hover:-translate-y-1 cursor-pointer h-full flex flex-col"
        >
            {/* Image Section */}
            <div className="relative h-[220px] bg-[#111] flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-[#111] flex items-center justify-center">
                        <span className="text-7xl select-none opacity-20">
                            {style.icon}
                        </span>
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const nowWished = !isWished;
                        setIsWished(nowWished);
                        if (nowWished) {
                            trackLike('home', item.id.toString(), merchantId);
                        } else {
                            trackUnlike('home', item.id.toString(), merchantId);
                        }
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
                    {businessName ? businessName : style.tag}
                </div>

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

                {/* Footer Actions */}
                <div className="flex gap-2.5 pt-3 mt-auto">
                    {!hideBuyButton ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBuy();
                                }}
                                className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-bold tracking-wide uppercase bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors active:scale-95"
                            >
                                {item.item_type === 'SERVICE' ? (
                                    <Calendar className="w-4 h-4" />
                                ) : (
                                    <ShoppingBag className="w-4 h-4" />
                                )}
                                {item.item_type === 'SERVICE' ? 'Réserver' : 'Commander'}
                            </button>

                            <button
                                onClick={handleAddToCart}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2a2a2a] border border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#3a3a3a] transition-all active:scale-95"
                                title="Ajouter au panier"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCompare?.();
                                }}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${compared
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-[#2a2a2a] border-[#3a3a3a] text-zinc-300 hover:text-white hover:bg-[#3a3a3a]'
                                    }`}
                                title="Comparer"
                            >
                                <Scale className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.();
                            }}
                            className="flex-1 h-10 flex items-center justify-center gap-2 text-xs font-bold tracking-wide uppercase bg-[#2a2a2a] text-zinc-300 rounded-xl hover:text-white hover:bg-[#3a3a3a] transition-colors active:scale-95"
                        >
                            Détails
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
