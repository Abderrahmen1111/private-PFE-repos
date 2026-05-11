export interface Business {
    id: string;
    store_id?: number;
    owner_id?: string;
    id_business?: number;
    status?: string;
    name: string;
    image?: string;
    rating: number;
    rating_average?: number;
    reviewCount: number;
    total_reviews?: number;
    category: string;
    priceRange?: string;
    isOpen?: boolean;
    description?: string;
    phone?: string;
    website?: string;
    photos?: string[];
    gallery?: string[];
    workingHours?: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    location: {
        address: string;
        lat: number;
        lng: number;
    };
}
