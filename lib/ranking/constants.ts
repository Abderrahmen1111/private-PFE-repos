import type { IntentMode } from './types'

/** Weights per intent mode [rel, eng, prox, fresh, pers, boost] */
export const INTENT_WEIGHTS = {
  SEARCH: {
    relevance: 0.4,
    engagement: 0.15,
    proximity: 0.2,
    freshness: 0.1,
    personalization: 0.15,
    business_boost: 0.0,
  },
  DISCOVERY: {
    relevance: 0.1,
    engagement: 0.35,
    proximity: 0.15,
    freshness: 0.15,
    personalization: 0.25,
    business_boost: 0.0,
  },
  PROBLEM: {
    relevance: 0.25,
    engagement: 0.0,
    proximity: 0.4,
    freshness: 0.0,
    personalization: 0.0,
    business_boost: 0.0,
    // Special: availability 0.20, rating 0.15
  },
  PASSIVE: {
    relevance: 0.0,
    engagement: 0.5,
    proximity: 0.1,
    freshness: 0.2,
    personalization: 0.15,
    business_boost: 0.05,
  },
  DEAL: {
    relevance: 0.1,
    engagement: 0.25,
    proximity: 0.2,
    freshness: 0.2,
    personalization: 0.1,
    business_boost: 0.15,
    // Special: discount 0.35 replaces relevance
  },
  REENGAGEMENT: {
    relevance: 0.1,
    engagement: 0.2,
    proximity: 0.1,
    freshness: 0.1,
    personalization: 0.5,
    business_boost: 0.0,
  },
  TRANSACTION: {
    relevance: 0.2,
    engagement: 0.1,
    proximity: 0.3,
    freshness: 0.0,
    personalization: 0.2,
    business_boost: 0.2,
  },
} as const satisfies Record<
  IntentMode,
  {
    relevance: number
    engagement: number
    proximity: number
    freshness: number
    personalization: number
    business_boost: number
  }
>

/** Intent update signals (decay * old + delta * new_signal) */
export const INTENT_SIGNAL_WEIGHTS: Record<
  string,
  Partial<Record<IntentMode, number>>
> = {
  search: { SEARCH: 1.0 },
  contact: { PROBLEM: 1.0, TRANSACTION: 0.5 },
  map_click: { PROBLEM: 0.7 },
  category_click: { PROBLEM: 0.4, DISCOVERY: 0.3 },
  scroll_fast: { PASSIVE: 0.5 },
  discount_click: { DEAL: 0.8 },
  save: { DISCOVERY: 0.4, REENGAGEMENT: 0.3 },
  revisit: { REENGAGEMENT: 0.9 },
  purchase: { TRANSACTION: 1.0 },
  like: { DISCOVERY: 0.3, PASSIVE: 0.2 },
}

export const DECAY_FACTOR = 0.8 // temporal decay per event
export const EPSILON = 0.15 // exploration factor
export const SLIDING_WINDOW_SIZE = 10 // last N events
export const SLIDING_WINDOW_SECS = 30 // OR last N seconds
export const FRESHNESS_LAMBDA = 0.1 // decay rate per hour
export const COLD_START_THRESHOLD = 10 // min interactions

/** Action strength weights for interaction_intensity */
export const ACTION_STRENGTH: Record<string, number> = {
  purchase: 1.0,
  contact: 0.9,
  save: 0.7,
  like: 0.5,
  click: 0.4,
  search: 0.6,
  view: 0.1,
  scroll: 0.05,
}
