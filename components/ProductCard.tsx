'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/actions/items';
import { Star, Package, ShoppingCart, Scale, Heart, Zap } from 'lucide-react';

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

export function ProductCard({ item, businessName, compared, promotion, onCompare, onViewDetails }: ProductCardProps) {
    const [isWished, setIsWished] = useState(false);
    const typeKey = item.item_type === 'SERVICE' ? 'services' : 'other'; // Simplified mapping for now
    const style = categoryStyles[typeKey] || categoryStyles.other;

    const hasDiscount = !!promotion?.discount_percent;
    const discountedPrice = hasDiscount
        ? item.price * (1 - (promotion.discount_percent! / 100))
        : item.price;

    return (
        <div
            onClick={onViewDetails}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-100 hover:border-stone-200 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
        >
            {/* Image Section */}
            <div className="relative h-48 bg-stone-50 flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">
                            {style.icon}
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsWished(!isWished);
                    }}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isWished ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white/90 text-stone-400 hover:text-rose-500'
                        } shadow-lg backdrop-blur-sm`}
                >
                    <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                </button>

                {/* Category Tag */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    {hasDiscount && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl bg-rose-600 text-white shadow-lg animate-pulse">
                            <Zap className="w-3 h-3 fill-white" /> {promotion.discount_percent}% OFF
                        </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm ${style.color}`}>
                        {style.icon} {style.tag}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className="text-base font-bold text-stone-800 leading-tight line-clamp-2 h-10">
                    {item.name}
                </h3>

                <div className="flex flex-col">
                    {hasDiscount && (
                        <span className="text-xs font-bold text-rose-500 line-through opacity-60">
                            {item.price.toLocaleString()} DT
                        </span>
                    )}
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${hasDiscount ? 'text-rose-600' : 'text-stone-900'}`}>
                            {discountedPrice.toLocaleString()}
                        </span>
                        <span className={`text-sm font-bold uppercase ${hasDiscount ? 'text-rose-400' : 'text-stone-500'}`}>
                            DT
                        </span>
                    </div>
                </div>

                {businessName && (
                    <div className="flex items-center gap-2 py-1">
                        <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-[10px] border border-stone-200">
                            🏪
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-stone-700">{businessName}</span>
                            <Stars n={5} />
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Disponible
                    </span>
                    {item.item_type === 'PRODUCT' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                            🚚 Livraison
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.();
                        }}
                        className="flex-1 text-[13px] font-bold bg-stone-900 text-white py-2.5 rounded-xl hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-200"
                    >
                        Détails
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCompare?.();
                        }}
                        className={`w-11 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${compared
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                            : 'bg-white border-stone-200 text-stone-400 hover:border-indigo-500 hover:text-indigo-600'
                            } shadow-sm`}
                        title="Comparer"
                    >
                        <Scale className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
