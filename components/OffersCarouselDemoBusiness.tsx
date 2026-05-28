'use client';

import * as React from "react";
import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { OffersCarousel, type CarouselItem } from "@/components/ui/offers-carousel-business";
import { getAllActivePromotions } from "@/lib/actions/promotions";

const OffersCarouselDemo = () => {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setIsLoading(true);
        const promotions = await getAllActivePromotions(5);

        // Map promotions to CarouselItem format
        const mappedItems: CarouselItem[] = promotions.map((promo: any, index) => {
          const originalPrice = promo.originale_price || 100;
          const discountedPrice = promo.new_price || (originalPrice * (1 - (promo.discount_percent || 10) / 100));
          const discountPercent = promo.discount_percent || Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

          return {
            id: promo.id,
            imageUrl: promo.stores?.logo_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
            title: promo.title,
            subtitle: promo.stores?.name || "Store",
            rating: 4.5,
            price: discountedPrice,
            originalPrice: originalPrice,
            discountPercentage: discountPercent,
          };
        });

        setItems(mappedItems);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
        setError('Failed to load promotions');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPromotions();
  }, []);

  return (
    <div className="w-full min-h-[500px] bg-[#F9F8F6] flex flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-[#111111]">Seulement pour aujourd'hui 🔥🎁</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Chargement des offres...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Aucune offre active pour le moment</p>
          </div>
        ) : (
          <OffersCarousel
            offerTitle="Today Only 🔥🎁"
            offerSubtitle="Special offers from top stores!"
            ctaText="View all offers"
            onCtaClick={() => {
              console.log("Redirecting to all offers...");
            }}
            items={items}
          />
        )}
      </div>
    </div>
  );
};

export default OffersCarouselDemo;