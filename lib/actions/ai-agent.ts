'use server'

// ─────────────────────────────────────────────
// lib/actions/ai-agent.ts
//
// FIX: unstable_cache cannot call cookies() inside it.
// createClient() calls cookies() → crash.
//
// Solution: run all Supabase queries OUTSIDE the cache,
// then cache only the pure data transformation.
// ─────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type {
  StoreContext,
  StoreItem,
  StoreOrder,
  StoreBooking,
  StoreReview,
  WeeklyDay,
} from '@/types/ai-agent'

// ── Step 1: Fetch raw data from Supabase ─────
// This runs OUTSIDE unstable_cache so cookies() works fine

async function fetchRawStoreData(storeId: number) {
  const supabase = createClient() // cookies() called here — outside cache ✓

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoISO = sevenDaysAgo.toISOString()

  const [
    storeRes,
    itemsRes,
    ordersRes,
    bookingsRes,
    reviewsRes,
    weeklyOrdersRes,
    weeklyBookingsRes,
  ] = await Promise.all([
    supabase
      .from('stores')
      .select(
        'name, category, status, city, rating_average, sentiment_positive_percent, view_count, total_orders'
      )
      .eq('id', storeId)
      .single(),

    supabase
      .from('items')
      .select(
        'id, name, item_type, price, price_unit, stock_quantity, status, view_count, order_count, booking_count, rating_average'
      )
      .eq('store_id', storeId)
      .neq('status', 'ARCHIVED')
      .order('order_count', { ascending: false })
      .limit(30),

    supabase
      .from('orders')
      .select('id, customer_name, total_price, quantity, status, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50),

    supabase
      .from('bookings')
      .select('id, customer_name, price, status, booking_date, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50),

    supabase
      .from('reviews')
      .select(
        'id, rating, comment, sentiment_label, sentiment_score, vendor_response, created_at'
      )
      .eq('store_id', storeId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(30),

    supabase
      .from('orders')
      .select('created_at')
      .eq('store_id', storeId)
      .gt('created_at', sevenDaysAgoISO),

    supabase
      .from('bookings')
      .select('created_at')
      .eq('store_id', storeId)
      .gt('created_at', sevenDaysAgoISO),
  ])

  return {
    store: storeRes.data,
    items: itemsRes.data || [],
    orders: ordersRes.data || [],
    bookings: bookingsRes.data || [],
    reviews: reviewsRes.data || [],
    weeklyOrders: weeklyOrdersRes.data || [],
    weeklyBookings: weeklyBookingsRes.data || [],
  }
}

// ── Step 2: Transform raw data → StoreContext ─
// This pure function IS safe to cache (no cookies, no dynamic data)

function buildStoreContext(storeId: number, raw: Awaited<ReturnType<typeof fetchRawStoreData>>): StoreContext {
  const { store, items, orders, bookings, reviews, weeklyOrders, weeklyBookings } = raw

  const weeklyStats = buildWeeklyStats(weeklyOrders, weeklyBookings)

  return {
    storeId,
    storeName: store?.name ?? 'Unknown Store',
    storeCategory: (store?.category as StoreContext['storeCategory']) ?? 'OTHER',
    storeStatus: (store?.status as StoreContext['storeStatus']) ?? 'PENDING',
    storeCity: store?.city ?? '',
    ratingAverage: store?.rating_average ?? null,
    sentimentPositivePercent: store?.sentiment_positive_percent ?? null,
    viewCount: store?.view_count ?? null,
    totalOrders: store?.total_orders ?? null,
    items: items as StoreItem[],
    orders: orders as StoreOrder[],
    bookings: bookings as StoreBooking[],
    reviews: reviews as StoreReview[],
    weeklyStats,
  }
}

// ── Step 3: Cache the transformed data ────────
// We pass serializable data into the cache — no cookies, no Supabase client

function getCachedContext(storeId: number, raw: Awaited<ReturnType<typeof fetchRawStoreData>>) {
  return unstable_cache(
    async () => buildStoreContext(storeId, raw),
    [`ai-agent-context-${storeId}`],
    { revalidate: 300 }
  )()
}

// ── Public API ────────────────────────────────
// Call this from your API route

export async function getStoreContext(storeId: number): Promise<StoreContext> {
  try {
    // Fetch outside cache (cookies work here)
    const raw = await fetchRawStoreData(storeId)
    // Transform inside cache (pure data, no cookies)
    return await getCachedContext(storeId, raw)
  } catch (err) {
    console.error('[getStoreContext] Error:', err)
    // Return empty context — never crash the API route
    return {
      storeId,
      storeName: 'Unknown Store',
      storeCategory: 'OTHER',
      storeStatus: 'PENDING',
      storeCity: '',
      ratingAverage: null,
      sentimentPositivePercent: null,
      viewCount: null,
      totalOrders: null,
      items: [],
      orders: [],
      bookings: [],
      reviews: [],
      weeklyStats: [],
    }
  }
}

// ── Helpers ───────────────────────────────────

function buildWeeklyStats(
  orders: { created_at: string | null }[],
  bookings: { created_at: string | null }[]
): WeeklyDay[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const last7: WeeklyDay[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7.push({
      day: days[d.getDay()],
      fullDate: d.toISOString().split('T')[0],
      actions: 0,
    })
  }

  const countInto = (items: { created_at: string | null }[]) => {
    items.forEach((item) => {
      if (!item.created_at) return
      const date = item.created_at.split('T')[0]
      const match = last7.find((d) => d.fullDate === date)
      if (match) match.actions++
    })
  }

  countInto(orders)
  countInto(bookings)

  return last7
}