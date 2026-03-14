'use server';

import { createClient } from '@/lib/supabase/server';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  price_unit: string;
  duration_minutes: number;
  is_bookable: boolean;
  available_days: number[] | null;
  main_image: string | null;
  image_2: string | null;
  image_3: string | null;
  status: string;
  view_count: number;
  booking_count: number;
  rating_average: number;
  total_reviews: number;
  created_at: string;
  store: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    phone: string;
    email: string | null;
    website: string | null;
    address: string;
    city: string;
    logo_url: string | null;
    banner_url: string | null;
    rating_average: number;
    total_reviews: number;
    opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
    kyc_verified_at: string | null;
  };
  schedules: {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    max_bookings: number;
  }[];
}

export interface ServiceReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  is_verified: boolean;
  vendor_response: string | null;
  responded_at: string | null;
  created_at: string;
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// ── Fetch service by id ───────────────────────────────────────────────────────

export async function getServiceById(id: number): Promise<ServiceDetail | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      slug,
      description,
      price,
      price_unit,
      duration_minutes,
      is_bookable,
      available_days,
      main_image,
      image_2,
      image_3,
      status,
      view_count,
      booking_count,
      rating_average,
      total_reviews,
      created_at,
      stores (
        id,
        name,
        slug,
        description,
        category,
        phone,
        email,
        website,
        address,
        city,
        logo_url,
        banner_url,
        rating_average,
        total_reviews,
        opening_hours,
        kyc_verified_at
      ),
      service_schedules (
        id,
        day_of_week,
        start_time,
        end_time,
        max_bookings
      )
    `)
    .eq('id', id)
    .eq('item_type', 'SERVICE')
    .eq('status', 'AVAILABLE')
    .single();

  if (error || !data) {
    console.error('getServiceById error:', error);
    return null;
  }

  // Increment view count (fire-and-forget)
  supabase
    .from('items')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', id)
    .then(() => {});

  return {
    ...data,
    store: Array.isArray(data.stores) ? data.stores[0] : data.stores,
    schedules: data.service_schedules ?? [],
  } as ServiceDetail;
}

// ── Fetch reviews for a service ───────────────────────────────────────────────

export async function getServiceReviews(itemId: number): Promise<ServiceReview[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      is_verified,
      vendor_response,
      responded_at,
      created_at,
      users (
        full_name,
        avatar_url
      )
    `)
    .eq('item_id', itemId)
    .eq('is_approved', true)
    .eq('is_spam', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('getServiceReviews error:', error);
    return [];
  }

  return (data ?? []).map((r: any) => ({
    ...r,
    author: Array.isArray(r.users) ? r.users[0] : r.users,
  }));
}

// ── Fetch related services from same store ────────────────────────────────────

export async function getRelatedServices(storeId: number, excludeId: number): Promise<Partial<ServiceDetail>[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('items')
    .select('id, name, price, price_unit, main_image, duration_minutes, rating_average')
    .eq('store_id', storeId)
    .eq('item_type', 'SERVICE')
    .eq('status', 'AVAILABLE')
    .neq('id', excludeId)
    .limit(4);

  if (error) {
    console.error('getRelatedServices error:', error);
    return [];
  }

  return data ?? [];
}