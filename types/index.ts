export type BusinessCategory = 
  | 'boutique' 
  | 'restaurant' 
  | 'hotel' 
  | 'salon' 
  | 'grocery' 
  | 'automotive' 
  | 'fitness' 
  | 'other';

export type ActionType = 'phone_click' | 'direction_click' | 'reservation' | 'purchase' | 'contact';

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  address: string;
  phone: string;
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  stock?: number;
  createdAt: Date;
}

export interface Review {
  id: string;
  businessId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: Date;
  ownerResponse?: {
    text: string;
    respondedAt: Date;
  };
}

export interface CustomerAction {
  id: string;
  businessId: string;
  type: ActionType;
  timestamp: Date;
  details: string;
}

export interface Promotion {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discountPercent?: number;
  discountText?: string;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}

export interface AnalyticsSnapshot {
  profileViews: number;
  phoneClicks: number;
  directionClicks: number;
  reservations: number;
  purchases: number;
  period: 'today' | 'week' | 'month';
}

export interface SubscriptionPlan {
  name: 'free' | 'pro' | 'business';
  features: {
    products: boolean;
    promotions: boolean;
    analytics: boolean;
    reviews: boolean;
    imageGallery: boolean;
    maxProducts: number;
  };
}

export interface BusinessOwnerAccount {
  id: string;
  email: string;
  businessProfile: BusinessProfile;
  plan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}
