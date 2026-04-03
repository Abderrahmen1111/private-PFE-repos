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
    verified_at: string | null;
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
        verified_at
      )
    `)
    .eq('id', id)
    .eq('item_type', 'PRODUCT')
    .neq('status', 'UNAVAILABLE')
    .single() as any;

  if (error || !data) {
    console.error('getProductById error:', error);
    return null;
  }

  // Fire-and-forget view count increment
  (supabase.from('items') as any)
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', id)
    .then(() => {});

  const storeObj = Array.isArray(data.stores) ? data.stores[0] : data.stores;

  return {
    ...data,
    store: storeObj || {
        id: 0,
        name: 'Vendeur',
        slug: '',
        description: null,
        category: 'Produit',
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

export async function getRelatedItems(storeId: number, excludeId: number): Promise<any[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('items')
    .select('id, name, price, price_unit, main_image, stock_quantity, rating_average, item_type, duration_minutes')
    .eq('store_id', storeId)
    .neq('status', 'UNAVAILABLE')
    .neq('id', excludeId)
    .limit(4);


  if (error) {
    console.error('getRelatedItems error:', error);
    return [];
  }

  return data ?? [];
}