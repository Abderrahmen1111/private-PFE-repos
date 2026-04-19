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
    verified_at: string | null;
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

export async function getServiceById(identifier: any): Promise<ServiceDetail | null> {
  const supabase = createClient();
  const isNumeric = !isNaN(Number(identifier));
  
  // 1. Try to find in 'items' table first
  let itemsQuery = supabase
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
        verified_at
      ),
      service_schedules (
        id,
        day_of_week,
        start_time,
        end_time,
        max_bookings
      )
    `)
    .eq('item_type', 'SERVICE');
    
  if (isNumeric) {
    itemsQuery = itemsQuery.eq('id', identifier);
  } else {
    itemsQuery = itemsQuery.eq('slug', identifier);
  }
  
  const { data: itemData, error: itemError } = await (itemsQuery.single() as any);

  if (itemData) {
    // Increment view count (fire-and-forget)
    (supabase.from('items') as any)
      .update({ view_count: (itemData.view_count ?? 0) + 1 })
      .eq('id', itemData.id)
      .then(() => {});

    const storeObj = Array.isArray(itemData.stores) ? itemData.stores[0] : itemData.stores;

    return {
      ...itemData,
      store: storeObj || {
          id: 0,
          name: 'Prestataire',
          slug: '',
          description: null,
          category: 'Service',
          phone: '',
          email: null,
          website: null,
          address: '',
          city: '',
          logo_url: null,
          banner_url: null,
          rating_average: 0,
          total_reviews: 0,
          opening_hours: null,
          verified_at: null
      },
      schedules: itemData.service_schedules ?? [],
    } as ServiceDetail;
  }

  // 2. If not found in items, try 'service_directory'
  let dirQuery = supabase
    .from('service_directory')
    .select(`
        *,
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
            verified_at
        )
    `);

  if (isNumeric) {
    dirQuery = dirQuery.eq('service_id', identifier);
  } else {
    dirQuery = dirQuery.eq('slug', identifier);
  }
  
  const { data: dirData, error: dirError } = await (dirQuery.single() as any);

  if (dirData) {
    return {
      id: dirData.service_id,
      name: dirData.name,
      slug: dirData.slug,
      description: dirData.description,
      price: 0, // Directory handles often don't have fixed prices in DB
      price_unit: 'variable',
      duration_minutes: 0,
      is_bookable: !!dirData.owner_id,
      available_days: null,
      main_image: dirData.main_image || null,
      image_2: null,
      image_3: null,
      status: dirData.status || 'ACTIVE',
      view_count: 0,
      booking_count: 0,
      rating_average: dirData.rating_average || 0,
      total_reviews: dirData.total_reviews || 0,
      created_at: dirData.created_at,
      store: dirData.stores || {
          id: 0,
          name: dirData.name,
          slug: dirData.slug,
          description: dirData.description,
          category: dirData.category || 'Service',
          phone: dirData.phone || '',
          email: null,
          website: null,
          address: dirData.address || '',
          city: dirData.city || '',
          logo_url: null,
          banner_url: null,
          rating_average: dirData.rating_average || 0,
          total_reviews: dirData.total_reviews || 0,
          opening_hours: dirData.opening_hours || null,
          verified_at: null
      },
      schedules: [],
    } as ServiceDetail;
  }

  if (itemError && dirError) {
      console.log('getServiceById: not found in items or service_directory, checking native stores...');
  }

  // 3. Fallback: try the 'stores' table directly (for native stores acting as services)
  let storeQuery = supabase
      .from('stores')
      .select('id, name, slug, description, category, phone, address, city, rating_average, total_reviews, opening_hours, logo_url, status');

  if (isNumeric) {
      storeQuery = storeQuery.eq('id', Number(identifier));
  } else {
      storeQuery = storeQuery.eq('slug', identifier);
  }

  const { data: storeData } = await (storeQuery.maybeSingle() as any);

  if (storeData) {
      return {
          id: storeData.id,
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description,
          price: 0,
          price_unit: 'variable',
          duration_minutes: 0,
          is_bookable: true,
          available_days: null,
          main_image: storeData.logo_url || null,
          image_2: null,
          image_3: null,
          status: storeData.status || 'PUBLISHED',
          view_count: 0,
          booking_count: 0,
          rating_average: storeData.rating_average || 0,
          total_reviews: storeData.total_reviews || 0,
          created_at: '', // Not strictly needed for UI display
          store: {
              ...storeData,
              banner_url: null,
              verified_at: null,
              email: null,
              website: null
          },
          schedules: [],
      } as ServiceDetail;
  }

  return null;
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

export async function getRelatedItems(storeId: number, excludeId: number): Promise<any[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('items')
    .select('id, name, price, price_unit, main_image, duration_minutes, rating_average, item_type')
    .eq('store_id', storeId)
    .eq('status', 'AVAILABLE')
    .neq('id', excludeId)
    .limit(4);

  if (error) {
    console.error('getRelatedItems error:', error);
    return [];
  }

  return data ?? [];
}