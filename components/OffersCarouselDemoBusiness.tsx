import * as React from "react";
import { Gift } from "lucide-react";
import { OffersCarousel, type CarouselItem } from "@/components/ui/offers-carousel-business";

// Mock data for the hotel carousel items
const mockHotels: CarouselItem[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    title: "Ramada by Wyndham",
    subtitle: "5 star hotel in Katibagiya",
    rating: 4.7,
    price: 3671,
    originalPrice: 5500,
    discountPercentage: 33,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80",
    title: "Hotel Clarks Avadh",
    subtitle: "5 star hotel in Qaisar Bagh",
    rating: 4.3,
    price: 4114,
    originalPrice: 8249,
    discountPercentage: 50,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80",
    title: "The Oberoi Resort",
    subtitle: "Luxury resort with private pool",
    rating: 4.9,
    price: 6750,
    originalPrice: 9000,
    discountPercentage: 25,
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=500&q=80",
    title: "Hyatt Regency",
    subtitle: "Business hotel near airport",
    rating: 4.6,
    price: 5200,
    originalPrice: 6500,
    discountPercentage: 20,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
    title: "Radisson Blu",
    subtitle: "Modern hotel in city center",
    rating: 4.5,
    price: 4800,
    originalPrice: 7000,
    discountPercentage: 31,
  },
];



const OffersCarouselDemo = () => {
  return (
    <div className="w-full min-h-[500px] bg-[#F9F8F6] flex flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-[#111111]">Seulement pour aujourd'hui 🔥🎁</h2>
        <OffersCarousel
        offerTitle="Today Only 🔥🎁"
        offerSubtitle="CTBEST - Code pre-applied for you!"
        ctaText="View all offers"
        onCtaClick={() => alert("Redirecting to all offers...")}
        items={mockHotels}
      />
      </div>
    </div>
  );
};

export default OffersCarouselDemo;