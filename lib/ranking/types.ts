export type IntentMode =
  | 'SEARCH'
  | 'DISCOVERY'
  | 'PROBLEM'
  | 'PASSIVE'
  | 'DEAL'
  | 'REENGAGEMENT'
  | 'TRANSACTION'

export type EventType =
  | 'view'
  | 'scroll'
  | 'click'
  | 'search'
  | 'category_click'
  | 'contact'
  | 'save'
  | 'like'
  | 'map_click'
  | 'discount_click'
  | 'share'
  | 'watch'
  | 'purchase'
  | 'revisit'

export type ItemType = 'business' | 'product' | 'service' | 'reel'

export interface BehavioralEvent {
  user_id: string
  session_id: string
  event_type: EventType
  item_id?: string
  item_type?: ItemType
  category?: string
  scroll_speed?: number
  watch_time?: number
  distance_km?: number
  has_discount?: boolean
  query_length?: number
  price?: number
  metadata?: Record<string, unknown>
}

export interface FeatureVector {
  // Search signals
  has_search: number // 0 or 1
  num_search_events: number
  query_length: number
  num_filter_applied: number
  // Interaction signals
  click_rate: number // clicks/total_events
  interaction_rate: number // (clicks+saves)/total_events
  time_to_first_click: number // seconds
  clicks_per_view: number
  // Urgency signals
  has_contact: number // 0 or 1
  num_contact_events: number
  num_map_clicks: number
  location_used: number // 0 or 1
  time_to_first_action: number
  // Passive signals
  avg_scroll_speed: number // 0-1 normalized
  num_scrolls: number
  avg_watch_time: number // seconds
  views_per_session: number
  // Discovery signals
  category_entropy: number // Shannon entropy
  num_unique_categories: number
  category_focus: number // max_cat/total_events
  category_switch_rate: number
  // Deal signals
  discount_ratio: number // discount_clicks/total_events
  has_discount_interaction: number // 0 or 1
  avg_price_clicked: number
  // Reengagement signals
  repeat_click_rate: number
  revisited_item: number // 0 or 1
  // Meta signals
  session_duration: number // seconds
  num_events: number
  interaction_intensity: number // action_strength/total_events
}

export interface IntentProbabilities {
  SEARCH: number
  DISCOVERY: number
  PROBLEM: number
  PASSIVE: number
  DEAL: number
  REENGAGEMENT: number
  TRANSACTION: number
}

export interface RankingItem {
  id: string
  type: ItemType
  title: string
  description?: string
  category?: string
  price?: number
  discount_pct?: number
  avg_rating?: number
  review_count?: number
  coordinates?: { lat: number; lng: number }
  is_open_now?: boolean
  is_promoted?: boolean
  is_new_merchant?: boolean
  created_at: string
  image_url?: string
  merchant_name?: string
  // Pre-computed scores from DB
  engagement_score: number
  quality_score: number
  boost_score: number
  content_embedding?: number[]
}

export interface ScoredItem extends RankingItem {
  // Individual dimension scores
  relevance_score: number
  engagement_score: number
  proximity_score: number
  freshness_score: number
  personalization_score: number
  business_boost_score: number
  // Final weighted score
  final_score: number
  // Debug info
  intent_breakdown?: Record<IntentMode, number>
}

export interface RankingContext {
  user_id: string
  session_id: string
  query?: string
  location?: { lat: number; lng: number }
  intent_probs: IntentProbabilities
  user_embedding?: number[]
  epsilon?: number // exploration factor, default 0.15
}
