'use client'

import React from 'react'
import { Zap, Timer, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Promotion {
    id: number
    title: string
    discount_percent?: number
    discount_text?: string
    valid_until: string
}

interface PromotionBannerProps {
    promotions: Promotion[]
}

export default function PromotionBanner({ promotions }: PromotionBannerProps) {
    const [isVisible, setIsVisible] = React.useState(true)

    if (!isVisible || promotions.length === 0) return null

    // Pick the most attractive promotion (usually highest discount or first one)
    const promo = promotions[0]
    const daysLeft = Math.ceil((new Date(promo.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white overflow-hidden sticky top-0 z-50 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="hidden sm:flex h-8 w-8 items-center justify-center bg-white/20 rounded-lg backdrop-blur-sm">
                            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="font-bold text-sm sm:text-base tracking-tight">
                                {promo.title}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md self-start sm:self-auto">
                                {promo.discount_percent ? `-${promo.discount_percent}%` : promo.discount_text}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {daysLeft > 0 && (
                            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-pink-100">
                                <Timer className="w-3.5 h-3.5" />
                                <span>FINIT DANS {daysLeft} JOUR{daysLeft > 1 ? 'S' : ''}</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
