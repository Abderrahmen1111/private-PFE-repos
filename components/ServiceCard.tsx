'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/actions/items';
import { Star, Calendar, Clock, Award, ShieldCheck, Heart, ArrowRight, Zap, Package, ShoppingCart, Scale } from 'lucide-react';

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

export function ServiceCard({ item, businessName, promotion, onBook, onViewDetails }: ServiceCardProps) {
    const [isWished, setIsWished] = useState(false);

    const hasDiscount = !!promotion?.discount_percent;
    const discountedPrice = hasDiscount
        ? item.price * (1 - (promotion.discount_percent! / 100))
        : item.price;

    return (
        <div
            onClick={onViewDetails}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-stone-100 hover:border-indigo-100 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
        >
            {/* Image/Visual Section */}
            <div className="relative h-44 bg-indigo-50/30 flex items-center justify-center overflow-hidden">
                {item.main_image ? (
                    <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">
                            ✨
                        </span>
                    </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {hasDiscount && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-lg animate-pulse">
                            <Zap className="w-3 h-3 fill-white" /> {promotion.discount_percent}% OFF
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/90 text-indigo-600 backdrop-blur-sm shadow-sm border border-indigo-50">
                        <Award className="w-3 h-3" /> Expert
                    </span>
                </div>

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

                {/* Overlay for price/category */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-indigo-600 text-white shadow-lg">
                        Service Professionnel
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-bold text-stone-800 leading-tight line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <div className="flex flex-col">
                            {hasDiscount && (
                                <span className="text-xs font-bold text-rose-500 line-through opacity-60">
                                    {item.price.toLocaleString()} DT
                                </span>
                            )}
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black ${hasDiscount ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    {discountedPrice.toLocaleString()}
                                </span>
                                <span className={`text-sm font-bold uppercase ${hasDiscount ? 'text-rose-400' : 'text-indigo-400'}`}>
                                    DT
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {businessName && (
                    <div className="flex items-center gap-2.5 py-1.5 border-t border-stone-50">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs border border-stone-200">
                            🏢
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-stone-700">{businessName}</span>
                            <div className="flex items-center gap-1.5">
                                <Stars n={5} />
                                <span className="text-[10px] text-stone-400">(4.9)</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        <Clock className="w-3 h-3" /> Flexibilité
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        <ShieldCheck className="w-3 h-3" /> Garanti
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBook?.();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 group/btn"
                    >
                        <Calendar className="w-4 h-4" />
                        Réserver
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.();
                        }}
                        className="w-11 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-400 hover:border-indigo-400 hover:text-indigo-500 transition-all active:scale-95 shadow-sm"
                        title="Détails"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
