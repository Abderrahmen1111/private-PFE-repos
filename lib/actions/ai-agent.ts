'use server'

import { unstable_cache } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type {
  StoreBooking,
  StoreContext,
  StoreItem,
  StoreOrder,
  StoreReview,
  WeeklyDay,
} from '@/types/ai-agent'

type StoreRow = Pick<
  Database['public']['Tables']['stores']['Row'],
  | 'name'
  | 'category'
  | 'status'
  | 'city'
  | 'rating_average'
  | 'sentiment_positive_percent'
  | 'view_count'
  | 'total_orders'
>

type ItemRow = Pick<
  Database['public']['Tables']['items']['Row'],
  | 'id'
  | 'name'
  | 'item_type'
  | 'price'
  | 'price_unit'
  | 'stock_quantity'
  | 'status'
  | 'view_count'
  | 'order_count'
  | 'booking_count'
  | 'rating_average'
>

type OrderRow = Pick<
  Database['public']['Tables']['orders']['Row'],
  'id' | 'customer_name' | 'total_price' | 'quantity' | 'status' | 'created_at'
>

type BookingRow = Pick<
  Database['public']['Tables']['bookings']['Row'],
  'id' | 'customer_name' | 'price' | 'status' | 'booking_date' | 'created_at'
>

type ReviewRow = Pick<
  Database['public']['Tables']['reviews']['Row'],
  | 'id'
  | 'rating'
  | 'comment'
  | 'sentiment_label'
  | 'sentiment_score'
  | 'vendor_response'
  | 'created_at'
>

type CreatedAtRow = { created_at: string | null }

function buildWeeklyStats(
  orderRows: CreatedAtRow[],
  bookingRows: CreatedAtRow[],
): WeeklyDay[] {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const last7Days: WeeklyDay[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    last7Days.push({
      day: dayLabels[d.getDay()],
      fullDate: d.toISOString().split('T')[0],
      actions: 0,
    })
  }

  const bump = (rows: CreatedAtRow[]) => {
    for (const row of rows) {
      if (!row.created_at) continue
      const dateKey = row.created_at.split('T')[0]
      const dayObj = last7Days.find((x) => x.fullDate === dateKey)
      if (dayObj) dayObj.actions += 1
    }
  }

  bump(orderRows)
  bump(bookingRows)
  return last7Days
}

function mapItem(row: ItemRow): StoreItem {
  return {
    id: row.id,
    name: row.name,
    item_type: row.item_type,
    price: row.price,
    price_unit: row.price_unit,
    stock_quantity: row.stock_quantity,
    status: row.status,
    view_count: row.view_count,
    order_count: row.order_count,
    booking_count: row.booking_count,
    rating_average: row.rating_average,
  }
}

function mapOrder(row: OrderRow): StoreOrder {
  return {
    id: row.id,
    customer_name: row.customer_name,
    total_price: row.total_price,
    quantity: row.quantity,
    status: row.status,
    created_at: row.created_at,
  }
}

function mapBooking(row: BookingRow): StoreBooking {
  return {
    id: row.id,
    customer_name: row.customer_name,
    price: row.price,
    status: row.status,
    booking_date: row.booking_date,
    created_at: row.created_at,
  }
}

function mapReview(row: ReviewRow): StoreReview {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    sentiment_label: row.sentiment_label,
    sentiment_score: row.sentiment_score,
    vendor_response: row.vendor_response,
    created_at: row.created_at,
  }
}

function emptyContext(storeId: number): StoreContext {
  const emptyWeek: WeeklyDay[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    emptyWeek.push({
      day: dayLabels[d.getDay()],
      fullDate: d.toISOString().split('T')[0],
      actions: 0,
    })
  }
  return {
    storeId,
    storeName: '',
    storeCategory: '',
    storeStatus: '',
    storeCity: '',
    ratingAverage: null,
    sentimentPositivePercent: null,
    viewCount: null,
    totalOrders: null,
    items: [],
    orders: [],
    bookings: [],
    reviews: [],
    weeklyStats: emptyWeek,
  }
}

async function fetchStoreContextInternal(storeId: number): Promise<StoreContext> {
  const supabase = createClient()
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
        'name, category, status, city, rating_average, sentiment_positive_percent, view_count, total_orders',
      )
      .eq('id', storeId)
      .maybeSingle(),
    supabase
      .from('items')
      .select(
        'id, name, item_type, price, price_unit, stock_quantity, status, view_count, order_count, booking_count, rating_average',
      )
      .eq('store_id', storeId)
      .neq('status', 'ARCHIVED')
      .order('order_count', { ascending: false, nullsFirst: false })
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
        'id, rating, comment, sentiment_label, sentiment_score, vendor_response, created_at',
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

  if (storeRes.error) {
    console.error('[ai-agent] stores query:', storeRes.error.message)
  }
  if (itemsRes.error) console.error('[ai-agent] items query:', itemsRes.error.message)
  if (ordersRes.error) console.error('[ai-agent] orders query:', ordersRes.error.message)
  if (bookingsRes.error) console.error('[ai-agent] bookings query:', bookingsRes.error.message)
  if (reviewsRes.error) console.error('[ai-agent] reviews query:', reviewsRes.error.message)
  if (weeklyOrdersRes.error) {
    console.error('[ai-agent] weekly orders query:', weeklyOrdersRes.error.message)
  }
  if (weeklyBookingsRes.error) {
    console.error('[ai-agent] weekly bookings query:', weeklyBookingsRes.error.message)
  }

  const store = storeRes.data as StoreRow | null
  const itemsData = (itemsRes.data ?? []) as ItemRow[]
  const ordersData = (ordersRes.data ?? []) as OrderRow[]
  const bookingsData = (bookingsRes.data ?? []) as BookingRow[]
  const reviewsData = (reviewsRes.data ?? []) as ReviewRow[]
  const weeklyOrdersData = (weeklyOrdersRes.data ?? []) as CreatedAtRow[]
  const weeklyBookingsData = (weeklyBookingsRes.data ?? []) as CreatedAtRow[]

  if (!store) {
    return emptyContext(storeId)
  }

  return {
    storeId,
    storeName: store.name ?? '',
    storeCategory: store.category ?? '',
    storeStatus: store.status ?? '',
    storeCity: store.city ?? '',
    ratingAverage: store.rating_average,
    sentimentPositivePercent: store.sentiment_positive_percent,
    viewCount: store.view_count,
    totalOrders: store.total_orders,
    items: itemsData.map(mapItem),
    orders: ordersData.map(mapOrder),
    bookings: bookingsData.map(mapBooking),
    reviews: reviewsData.map(mapReview),
    weeklyStats: buildWeeklyStats(weeklyOrdersData, weeklyBookingsData),
  }
}

export async function getStoreContext(storeId: number): Promise<StoreContext> {
  const id = Number(storeId)
  if (!Number.isFinite(id) || id <= 0) {
    return emptyContext(Number.isFinite(id) ? id : 0)
  }

  return unstable_cache(
    async () => fetchStoreContextInternal(id),
    ['ai-agent-store-context', String(id)],
    { revalidate: 300 },
  )()
}
