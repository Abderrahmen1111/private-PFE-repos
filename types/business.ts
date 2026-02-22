export interface Business {
    id: string;
    name: string;
    image?: string;
    rating: number;
    reviewCount: number;
    category: string;
    priceRange?: string;
    isOpen?: boolean;
    description?: string;
    phone?: string;
    website?: string;
    photos?: string[];
    location: {
        address: string;
        lat: number;
        lng: number;
    };
}
