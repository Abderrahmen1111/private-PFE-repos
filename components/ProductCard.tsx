'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/actions/items';
import { Star, Package, ShoppingCart, Scale, Heart, Zap, Calendar } from 'lucide-react';
import { useActionDrawer } from '@/hooks/useActionDrawer';

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
    
    const bName = businessName || (item as any).stores?.name || 'Commerce';

    const handleOpenBuy = () => {
        if (onBuy) {
            onBuy();
        } else {
            // Check if CommandSidebar exists on this page
            const commandSidebar = document.getElementById('command-sidebar');
            if (commandSidebar) {
                // On business page: dispatch event to open CommandSidebar
                window.dispatchEvent(new CustomEvent('openCommandSidebar', { detail: { item, businessName: bName } }));
                window.location.hash = 'command-sidebar';
            } else {
                // On search/other pages: open drawer directly
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
            onClick={onViewDetails}
            className="group relative bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden border border-stone-100/50 hover:border-stone-200 hover:-translate-y-2 cursor-pointer h-full flex flex-col"
        >
            {/* Image Section */}
            <div className="relative h-56 bg-[#F9F9F9] flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-700 opacity-20">
                            {style.icon}
                        </span>
                    </div>
                )}

                {/* Glassmorphic Overlays */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Wishlist Button (Premium Style) */}
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

                {/* Floating Badges (Glassmorphism) */}
                <div className="absolute bottom-5 left-5 flex flex-col gap-2.5">
                    {hasDiscount && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-white/20 text-white shadow-2xl animate-pulse">
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span className="text-[11px] font-black tracking-widest uppercase">-{promotion.discount_percent}%</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all duration-500 group-hover:px-5 ${style.color}`}>
                        <span className="text-sm">{style.icon}</span>
                        <span className="text-[10px] font-black tracking-[0.1em] uppercase whitespace-nowrap">{style.tag}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="space-y-1">
                    <h3 className="text-[17px] font-black text-stone-900 leading-[1.3] line-clamp-2 h-11 tracking-tight group-hover:text-stone-700 transition-colors">
                        {item.name}
                    </h3>
                    
                    {businessName && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center text-[10px] border border-stone-200 shadow-sm">
                                🏪
                            </div>
                            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest truncate max-w-[150px]">
                                {businessName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-[11px] font-bold text-rose-500/50 line-through tracking-wider">
                                {item.price.toLocaleString()} DT
                            </span>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black tracking-tighter ${hasDiscount ? 'text-rose-600' : 'text-stone-900'}`}>
                                {discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black border border-stone-200 px-1.5 py-0.5 rounded-md text-stone-400 uppercase ml-1">
                                DT
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Stars n={item.rating_average || 0} />
                        <span className="text-[10px] font-bold text-stone-300 tracking-tighter">
                            ({(item.total_reviews || 0).toLocaleString()} avis)
                        </span>
                    </div>
                </div>

                {/* Premium Footer Actions */}
                <div className="flex gap-2.5 pt-4 border-t border-stone-50">
                    {!hideBuyButton ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBuy();
                                }}
                                className="flex-1 overflow-hidden relative group/btn h-11 flex items-center justify-center gap-2 text-[12px] font-black tracking-widest uppercase bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                {item.item_type === 'SERVICE' ? (
                                    <Calendar className="w-4 h-4 mb-0.5" />
                                ) : (
                                    <ShoppingCart className="w-4 h-4 mb-0.5" />
                                )}
                                {item.item_type === 'SERVICE' ? 'Réserver' : 'Acheter'}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCompare?.();
                                }}
                                className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 ${compared
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 rotate-12 scale-110'
                                    : 'bg-white border-stone-100 text-stone-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
                                    } shadow-sm`}
                                title="Comparer"
                            >
                                <Scale className="w-4.5 h-4.5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails?.();
                            }}
                            className="flex-1 h-11 flex items-center justify-center gap-2 text-[12px] font-black tracking-widest uppercase bg-stone-100 text-stone-400 rounded-2xl hover:bg-stone-200 transition-all active:scale-95 border border-stone-100 shadow-sm"
                        >
                            Détails du produit
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Shine Effect on hover */}
            <div className="absolute -inset-full h-[500%] w-[500%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2s] pointer-events-none" />
        </div>
    );
}
