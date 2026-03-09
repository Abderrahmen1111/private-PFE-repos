'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { ReviewModal } from './ReviewModal'
// We removed the toast explicitly since it's no longer disabled

interface WriteReviewButtonProps {
    businessName: string
    storeId: number | undefined | null
    businessId?: string
}

export function WriteReviewButton({ businessName, storeId, businessId }: WriteReviewButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // The button is always active to allow shadow store creation
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
                <Star className="w-4 h-4" />
                Écrire un avis
            </button>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                businessName={businessName}
                storeId={storeId}
                businessId={businessId}
            />
        </>
    )
}
