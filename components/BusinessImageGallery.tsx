'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';

interface BusinessImageGalleryProps {
    images: string[];
    businessName: string;
}

export default function BusinessImageGallery({ images, businessName }: BusinessImageGalleryProps) {
    return (
        <div className="relative h-[260px] md:h-[320px] flex overflow-hidden">
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    alt={`${businessName} - ${idx + 1}`}
                    className="flex-1 object-cover"
                />
            ))}

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

            {/* See All Photos Button */}
            <button className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4" />
                See all {images.length > 1 ? `${images.length} photos` : 'photos'}
            </button>
        </div>
    );
}
