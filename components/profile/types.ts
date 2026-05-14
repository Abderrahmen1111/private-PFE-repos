export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface UserStats {
  total_reviews: number;
  helpful_votes: number;
  average_rating: number;
}

export interface Review {
  id: string;
  business_name: string;
  business_logo?: string | null;
  rating: number;
  comment: string;
  category: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
