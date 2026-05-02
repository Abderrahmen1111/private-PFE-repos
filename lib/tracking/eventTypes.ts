// All surfaces in your marketplace
export type Surface = 'search' | 'discover' | 'reels' | 'category' | 'nearby' | 'profile' | 'home';

// Simplified event types (based on your list)
export type EventType =
  // Core exposure / navigation
  | "view"
  | "impression"
  | "scroll"
  | "load_more"
  | "refresh"

  // Search intent
  | "search"
  | "refine"
  | "clear_search"
  | "no_results"

  // Interaction
  | "click"
  | "long_press"
  | "hover_dwell"

  // Filters / sorting
  | "filter"
  | "sort"
  | "radius_change"

  // Media / reels
  | "start"
  | "progress"
  | "pause"
  | "resume"
  | "complete"
  | "replay"
  | "skip"

  // Social
  | "like"
  | "unlike"
  | "save"
  | "unsave"
  | "share"
  | "follow"
  | "unfollow"

  // Conversion / high intent
  | "contact"
  | "direction_request"
  | "website_click"
  | "booking_start"
  | "booking_complete"
  | "purchase"

  // Negative feedback / quality control
  | "dismiss"
  | "hide"
  | "block"
  | "report"
  | "report_spam";

// Event parameters
export interface BaseEventParams {
  surface: Surface;
  event_type: EventType;
  item_id?: string;
  merchant_id?: string;
  category_id?: string;
  position?: number;
  query?: string;
  percentage?: number;
  duration_ms?: number;
  reason?: string;
  metadata?: Record<string, any>;
}