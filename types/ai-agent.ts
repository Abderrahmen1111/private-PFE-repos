export type AgentIntent =
  | 'analytics'
  | 'marketing'
  | 'product'
  | 'moderation'
  | 'general'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface StoreItem {
  id: number
  name: string
  item_type: 'PRODUCT' | 'SERVICE'
  price: number
  price_unit: string
  stock_quantity: number | null
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'
  view_count: number | null
  order_count: number | null
  booking_count: number | null
  rating_average: number | null
}

export interface StoreOrder {
  id: number
  customer_name: string
  total_price: number
  quantity: number
  status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  created_at: string | null
}

export interface StoreBooking {
  id: number
  customer_name: string
  price: number
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  booking_date: string
  created_at: string | null
}

export interface StoreReview {
  id: number
  rating: number
  comment: string
  sentiment_label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
  sentiment_score: number | null
  vendor_response: string | null
  created_at: string | null
}

export interface WeeklyDay {
  day: string
  fullDate: string
  actions: number
}

export interface StoreContext {
  storeId: number
  storeName: string
  storeCategory: string
  storeStatus: string
  storeCity: string
  ratingAverage: number | null
  sentimentPositivePercent: number | null
  viewCount: number | null
  totalOrders: number | null
  items: StoreItem[]
  orders: StoreOrder[]
  bookings: StoreBooking[]
  reviews: StoreReview[]
  weeklyStats: WeeklyDay[]
}
