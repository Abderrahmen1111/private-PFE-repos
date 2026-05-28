import { DECAY_FACTOR, INTENT_SIGNAL_WEIGHTS } from './constants'
import type {
  EventType,
  FeatureVector,
  IntentMode,
  IntentProbabilities,
} from './types'

const INTENT_MODES: IntentMode[] = [
  'SEARCH',
  'DISCOVERY',
  'PROBLEM',
  'PASSIVE',
  'DEAL',
  'REENGAGEMENT',
  'TRANSACTION',
]

const SOFTMAX_TEMPERATURE = 1.0

// ─── Probability utilities ────────────────────────────────────────────────────

function emptyIntentScores(): IntentProbabilities {
  return {
    SEARCH: 0,
    DISCOVERY: 0,
    PROBLEM: 0,
    PASSIVE: 0,
    DEAL: 0,
    REENGAGEMENT: 0,
    TRANSACTION: 0,
  }
}

/** Renormalize so all intent probabilities sum to 1. */
export function normalizeProbabilities(
  scores: IntentProbabilities
): IntentProbabilities {
  const sum = INTENT_MODES.reduce((acc, mode) => acc + scores[mode], 0)
  if (sum <= 0) return coldStartIntentDefaults()

  const normalized = emptyIntentScores()
  for (const mode of INTENT_MODES) {
    normalized[mode] = scores[mode] / sum
  }
  return normalized
}

/** Stable softmax over intent logits. */
export function softmax(logits: IntentProbabilities): IntentProbabilities {
  const scaled = INTENT_MODES.map(
    (mode) => logits[mode] / SOFTMAX_TEMPERATURE
  )
  const maxLogit = Math.max(...scaled)
  const exps = scaled.map((z) => Math.exp(z - maxLogit))
  const sumExp = exps.reduce((a, b) => a + b, 0)

  if (sumExp <= 0) return coldStartIntentDefaults()

  const probs = emptyIntentScores()
  INTENT_MODES.forEach((mode, i) => {
    probs[mode] = exps[i]! / sumExp
  })
  return probs
}

// ─── Cold start ───────────────────────────────────────────────────────────────

export function coldStartIntentDefaults(): IntentProbabilities {
  return {
    SEARCH: 0.05,
    DISCOVERY: 0.4,
    PROBLEM: 0.2,
    PASSIVE: 0.3,
    DEAL: 0.05,
    REENGAGEMENT: 0,
    TRANSACTION: 0,
  }
}

// ─── Rule-based intent from features ──────────────────────────────────────────

/**
 * Per-intent feature rules (weighted sums → logits → softmax).
 * Features are already in [0, 1].
 */
function computeIntentLogits(features: FeatureVector): IntentProbabilities {
  const f = features

  // SEARCH — explicit query / filter behavior
  const SEARCH =
    f.has_search * 3.0 +
    f.num_search_events * 2.2 +
    f.query_length * 1.8 +
    f.num_filter_applied * 1.4

  // DISCOVERY — diverse browsing, category exploration
  const DISCOVERY =
    f.category_entropy * 2.4 +
    f.num_unique_categories * 1.8 +
    f.category_switch_rate * 1.6 +
    (1 - f.category_focus) * 1.0 +
    f.interaction_rate * 0.9 +
    f.clicks_per_view * 0.5

  // PROBLEM — urgent, local, need-driven (contact, map, geo)
  const PROBLEM =
    f.has_contact * 2.8 +
    f.num_contact_events * 2.2 +
    f.num_map_clicks * 2.0 +
    f.location_used * 1.6 +
    f.time_to_first_action * 1.2 +
    (1 - f.category_entropy) * 0.4 +
    f.time_to_first_click * 0.6

  // PASSIVE — scroll / watch heavy, low deliberate interaction
  const PASSIVE =
    f.avg_scroll_speed * 2.2 +
    f.num_scrolls * 1.4 +
    f.avg_watch_time * 1.8 +
    f.views_per_session * 1.5 +
    (1 - f.click_rate) * 1.2 +
    (1 - f.interaction_intensity) * 1.0 +
    (1 - f.interaction_rate) * 0.6

  // DEAL — price / discount sensitivity
  const DEAL =
    f.discount_ratio * 2.6 +
    f.has_discount_interaction * 2.2 +
    f.avg_price_clicked * 0.9 +
    f.discount_ratio * f.avg_price_clicked * 0.5

  // REENGAGEMENT — returning to known items
  const REENGAGEMENT =
    f.repeat_click_rate * 2.8 +
    f.revisited_item * 2.5 +
    f.repeat_click_rate * f.revisited_item * 0.8

  // TRANSACTION — high-intent actions (contact + strong engagement)
  const TRANSACTION =
    f.has_contact * 1.8 +
    f.num_contact_events * 1.4 +
    f.interaction_intensity * 2.2 +
    f.click_rate * 1.0 +
    f.time_to_first_action * 1.0 +
    f.interaction_rate * 0.8

  return {
    SEARCH,
    DISCOVERY,
    PROBLEM,
    PASSIVE,
    DEAL,
    REENGAGEMENT,
    TRANSACTION,
  }
}

export function ruleBasedIntent(features: FeatureVector): IntentProbabilities {
  if (features.num_events <= 0) return coldStartIntentDefaults()

  const logits = computeIntentLogits(features)
  const hasSignal = INTENT_MODES.some((mode) => logits[mode] > 0.01)

  if (!hasSignal) return coldStartIntentDefaults()

  return softmax(logits)
}

// ─── Online intent update from events ─────────────────────────────────────────

function eventToSignalKey(event: EventType): string | null {
  const mapping: Partial<Record<EventType, string>> = {
    search: 'search',
    contact: 'contact',
    map_click: 'map_click',
    category_click: 'category_click',
    discount_click: 'discount_click',
    save: 'save',
    revisit: 'revisit',
    purchase: 'purchase',
    like: 'like',
    scroll: 'scroll_fast',
  }
  return mapping[event] ?? null
}

function getSignalDelta(event: EventType): Partial<Record<IntentMode, number>> {
  const key = eventToSignalKey(event)
  if (!key) return {}
  return INTENT_SIGNAL_WEIGHTS[key] ?? {}
}

/**
 * decay * current + delta, then renormalize to sum = 1.
 */
export function updateIntentScores(
  currentScores: IntentProbabilities,
  newEvent: EventType,
  decay: number = DECAY_FACTOR
): IntentProbabilities {
  const delta = getSignalDelta(newEvent)
  const updated = emptyIntentScores()

  for (const mode of INTENT_MODES) {
    updated[mode] = currentScores[mode] * decay + (delta[mode] ?? 0)
  }

  return normalizeProbabilities(updated)
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export function getDominantIntent(probs: IntentProbabilities): IntentMode {
  let dominant: IntentMode = 'DISCOVERY'
  let maxProb = -1

  for (const mode of INTENT_MODES) {
    if (probs[mode] > maxProb) {
      maxProb = probs[mode]
      dominant = mode
    }
  }

  return dominant
}

export function getTopIntents(
  probs: IntentProbabilities,
  n: number
): IntentMode[] {
  const limit = Math.max(1, Math.min(n, INTENT_MODES.length))

  return [...INTENT_MODES]
    .sort((a, b) => probs[b] - probs[a])
    .slice(0, limit)
}
