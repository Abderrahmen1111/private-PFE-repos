'use server';

import { createClient } from '@/lib/supabase/server';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  price_unit: string;
  stock_quantity: number;
  main_image: string | null;
  image_2: string | null;
  image_3: string | null;
  status: string;
  view_count: number;
  order_count: number;
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
}

export interface ProductReview {
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

// ── Fetch product by id ───────────────────────────────────────────────────────

export async function getProductById(id: number): Promise<ProductDetail | null> {
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
      stock_quantity,
      main_image,
      image_2,
      image_3,
      status,
      view_count,
      order_count,
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
      )
    `)
    .eq('id', id)
    .eq('item_type', 'PRODUCT')
    .neq('status', 'UNAVAILABLE')
    .single();

  if (error || !data) {
    console.error('getProductById error:', error);
    return null;
  }

  // Fire-and-forget view count increment
  supabase
    .from('items')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', id)
    .then(() => {});

  return {
    ...data,
    store: Array.isArray(data.stores) ? data.stores[0] : data.stores,
  } as ProductDetail;
}

// ── Fetch reviews for a product ───────────────────────────────────────────────

export async function getProductReviews(itemId: number): Promise<ProductReview[]> {
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
    console.error('getProductReviews error:', error);
    return [];
  }

  return (data ?? []).map((r: any) => ({
    ...r,
    author: Array.isArray(r.users) ? r.users[0] : r.users,
  }));
}

// ── Fetch related products from same store ────────────────────────────────────

export async function getRelatedProducts(storeId: number, excludeId: number): Promise<Partial<ProductDetail>[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('items')
    .select('id, name, price, price_unit, main_image, stock_quantity, rating_average')
    .eq('store_id', storeId)
    .eq('item_type', 'PRODUCT')
    .neq('status', 'UNAVAILABLE')
    .neq('id', excludeId)
    .limit(4);

  if (error) {
    console.error('getRelatedProducts error:', error);
    return [];
  }

  return data ?? [];
}