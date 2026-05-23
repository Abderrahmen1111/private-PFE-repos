import {
  ACTION_STRENGTH,
  DECAY_FACTOR,
  SLIDING_WINDOW_SECS,
  SLIDING_WINDOW_SIZE,
} from './constants'
import type { BehavioralEvent, EventType, FeatureVector } from './types'

// ─── Normalization caps (Tunisian marketplace heuristics) ───────────────────

const MAX_QUERY_LENGTH = 80
const MAX_WATCH_TIME_SEC = 300
const MAX_SESSION_DURATION_SEC = 3600
const MAX_SCROLL_EVENTS = 40
const MAX_SCROLL_SPEED = 3
const MAX_PRICE_TND = 5000
const MAX_TIME_TO_ACTION_SEC = 120
const MAX_VIEWS_PER_SESSION = 30
const MAX_UNIQUE_CATEGORIES = 12

const CLICK_TYPES: EventType[] = ['click']
const INTERACTION_TYPES: EventType[] = ['click', 'save', 'like']
const VIEW_TYPES: EventType[] = ['view', 'watch']
const ACTION_TYPES: EventType[] = [
  'click',
  'contact',
  'save',
  'purchase',
  'map_click',
  'search',
]

// ─── Utilities ──────────────────────────────────────────────────────────────

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function normalizeCount(count: number, cap: number): number {
  return clamp01(count / Math.max(cap, 1))
}

function getEventTimestamp(
  event: BehavioralEvent,
  index: number,
  sessionAnchorMs: number
): number {
  const meta = event.metadata
  if (meta) {
    if (typeof meta.timestamp === 'number') return meta.timestamp
    if (typeof meta.ts === 'number') return meta.ts
    if (typeof meta.created_at === 'string') {
      const parsed = Date.parse(meta.created_at)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  // Preserve ordering when timestamps are missing (1s spacing)
  return sessionAnchorMs + index * 1000
}

function sortEventsChronologically(events: BehavioralEvent[]): BehavioralEvent[] {
  const anchor = Date.now() - events.length * 1000
  return [...events]
    .map((event, index) => ({ event, index, ts: getEventTimestamp(event, index, anchor) }))
    .sort((a, b) => a.ts - b.ts || a.index - b.index)
    .map(({ event }) => event)
}

/** Temporal decay weights: oldest → newest, newest weight = 1. */
export function decayWeights(eventCount: number): number[] {
  if (eventCount <= 0) return []
  return Array.from({ length: eventCount }, (_, idx) =>
    Math.pow(DECAY_FACTOR, eventCount - 1 - idx)
  )
}

function weightedCount(
  flags: boolean[],
  weights: number[]
): number {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  if (totalWeight <= 0) return 0
  const weighted = flags.reduce((sum, flag, i) => sum + (flag ? weights[i] : 0), 0)
  return weighted / totalWeight
}

function weightedAverage(
  values: number[],
  weights: number[]
): number {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  if (totalWeight <= 0) return 0
  const weighted = values.reduce((sum, v, i) => sum + v * weights[i], 0)
  return weighted / totalWeight
}

// ─── Public helpers ─────────────────────────────────────────────────────────

/** Last N events and/or events within SLIDING_WINDOW_SECS of the newest event. */
export function getSlideWindowEvents(
  allEvents: BehavioralEvent[],
  limit: number = SLIDING_WINDOW_SIZE
): BehavioralEvent[] {
  if (allEvents.length === 0) return []

  const sorted = sortEventsChronologically(allEvents)
  const anchor = Date.now() - sorted.length * 1000
  const stamped = sorted.map((event, index) => ({
    event,
    ts: getEventTimestamp(event, index, anchor),
  }))

  const latestTs = stamped[stamped.length - 1]?.ts ?? Date.now()
  const cutoff = latestTs - SLIDING_WINDOW_SECS * 1000

  const withinTime = stamped.filter(({ ts }) => ts >= cutoff).map(({ event }) => event)
  const pool = withinTime.length > 0 ? withinTime : sorted

  return pool.slice(-limit)
}

/** Category → occurrence count (decay-unweighted; use for entropy). */
export function extractCategories(
  events: BehavioralEvent[]
): Record<string, number> {
  const freq: Record<string, number> = {}
  for (const event of events) {
    const category = event.category?.trim()
    if (!category) continue
    freq[category] = (freq[category] ?? 0) + 1
  }
  return freq
}

/** Decay-weighted mean action strength in [0, 1] (strengths are already ≤ 1). */
export function computeActionStrength(events: BehavioralEvent[]): number {
  if (events.length === 0) return 0

  const weights = decayWeights(events.length)
  const strengths = events.map(
    (e) => ACTION_STRENGTH[e.event_type] ?? 0.15
  )

  return clamp01(weightedAverage(strengths, weights))
}

function shannonEntropy(freq: Record<string, number>): number {
  const counts = Object.values(freq)
  const total = counts.reduce((sum, c) => sum + c, 0)
  if (total <= 0) return 0

  let entropy = 0
  for (const count of counts) {
    if (count <= 0) continue
    const p = count / total
    entropy -= p * Math.log2(p)
  }
  return entropy
}

function normalizedEntropy(freq: Record<string, number>): number {
  const k = Object.keys(freq).length
  if (k <= 1) return k === 0 ? 0 : 0
  const maxEntropy = Math.log2(k)
  return clamp01(shannonEntropy(freq) / maxEntropy)
}

function countCategorySwitches(events: BehavioralEvent[]): number {
  let switches = 0
  let prev: string | undefined

  for (const event of events) {
    const cat = event.category?.trim()
    if (!cat) continue
    if (prev !== undefined && cat !== prev) switches += 1
    prev = cat
  }

  return switches
}

function getFilterCount(event: BehavioralEvent): number {
  const meta = event.metadata
  if (!meta) return 0

  if (typeof meta.num_filters === 'number') return meta.num_filters
  if (typeof meta.filter_count === 'number') return meta.filter_count
  if (Array.isArray(meta.filters_applied)) return meta.filters_applied.length
  if (typeof meta.filters_applied === 'number') return meta.filters_applied

  return 0
}

function isFastScroll(event: BehavioralEvent): boolean {
  if (event.event_type !== 'scroll') return false
  const speed = event.scroll_speed ?? 0
  return speed >= 1.2
}

// ─── Cold start ─────────────────────────────────────────────────────────────

export function coldStartFeatureVector(): FeatureVector {
  return {
    has_search: 0,
    num_search_events: 0,
    query_length: 0,
    num_filter_applied: 0,
    click_rate: 0,
    interaction_rate: 0,
    time_to_first_click: 0,
    clicks_per_view: 0,
    has_contact: 0,
    num_contact_events: 0,
    num_map_clicks: 0,
    location_used: 0,
    time_to_first_action: 0,
    avg_scroll_speed: 0,
    num_scrolls: 0,
    avg_watch_time: 0,
    views_per_session: 0,
    category_entropy: 1,
    num_unique_categories: 0,
    category_focus: 0,
    category_switch_rate: 0,
    discount_ratio: 0,
    has_discount_interaction: 0,
    avg_price_clicked: 0,
    repeat_click_rate: 0,
    revisited_item: 0,
    session_duration: 0,
    num_events: 0,
    interaction_intensity: 0,
  }
}

// ─── Feature vector builder ─────────────────────────────────────────────────

export function buildFeatureVector(events: BehavioralEvent[]): FeatureVector {
  if (events.length === 0) return coldStartFeatureVector()

  const window = getSlideWindowEvents(events)
  const n = window.length
  const weights = decayWeights(n)

  const anchor = Date.now() - n * 1000
  const timestamps = window.map((e, i) => getEventTimestamp(e, i, anchor))
  const sessionStart = timestamps[0] ?? Date.now()
  const sessionEnd = timestamps[n - 1] ?? sessionStart
  const sessionDurationSec = Math.max((sessionEnd - sessionStart) / 1000, 1)

  const isType = (types: EventType[]) => (e: BehavioralEvent) =>
    types.includes(e.event_type)

  // ── Search ────────────────────────────────────────────────────────────────

  const searchFlags = window.map((e) => e.event_type === 'search')
  const hasSearch = weightedCount(searchFlags, weights) > 0 ? 1 : 0
  const numSearchEvents = normalizeCount(
    weightedCount(searchFlags, weights) * n,
    SLIDING_WINDOW_SIZE
  )

  const queryLengths = window.map((e) => {
    if (e.event_type !== 'search') return 0
    return e.query_length ?? (typeof e.metadata?.query_length === 'number'
      ? e.metadata.query_length
      : 0)
  })
  const maxQueryLength = Math.max(...queryLengths, 0)
  const queryLength = clamp01(maxQueryLength / MAX_QUERY_LENGTH)

  const filterCounts = window.map(getFilterCount)
  const numFilterApplied = clamp01(
    Math.max(...filterCounts, 0) / 5
  )

  // ── Interaction ───────────────────────────────────────────────────────────

  const clickFlags = window.map(isType(CLICK_TYPES))
  const interactionFlags = window.map(isType(INTERACTION_TYPES))
  const viewFlags = window.map(isType(VIEW_TYPES))

  const clickRate = weightedCount(clickFlags, weights)
  const interactionRate = weightedCount(interactionFlags, weights)

  const firstClickIdx = window.findIndex(isType(CLICK_TYPES))
  const timeToFirstClickRaw =
    firstClickIdx >= 0
      ? Math.max((timestamps[firstClickIdx]! - sessionStart) / 1000, 0)
      : sessionDurationSec
  const timeToFirstClick = clamp01(1 - timeToFirstClickRaw / MAX_TIME_TO_ACTION_SEC)

  const weightedClicks = weightedCount(clickFlags, weights) * n
  const weightedViews = Math.max(weightedCount(viewFlags, weights) * n, 1)
  const clicksPerView = clamp01(weightedClicks / weightedViews)

  // ── Urgency ───────────────────────────────────────────────────────────────

  const contactFlags = window.map((e) => e.event_type === 'contact')
  const mapFlags = window.map((e) => e.event_type === 'map_click')
  const locationFlags = window.map(
    (e) =>
      e.distance_km !== undefined ||
      e.metadata?.location_used === true ||
      e.metadata?.geo_used === true
  )

  const hasContact = weightedCount(contactFlags, weights) > 0 ? 1 : 0
  const numContactEvents = normalizeCount(
    weightedCount(contactFlags, weights) * n,
    SLIDING_WINDOW_SIZE
  )
  const numMapClicks = normalizeCount(
    weightedCount(mapFlags, weights) * n,
    SLIDING_WINDOW_SIZE
  )
  const locationUsed = weightedCount(locationFlags, weights) > 0 ? 1 : 0

  const firstActionIdx = window.findIndex(isType(ACTION_TYPES))
  const timeToFirstActionRaw =
    firstActionIdx >= 0
      ? Math.max((timestamps[firstActionIdx]! - sessionStart) / 1000, 0)
      : sessionDurationSec
  const timeToFirstAction = clamp01(
    1 - timeToFirstActionRaw / MAX_TIME_TO_ACTION_SEC
  )

  // ── Passive ───────────────────────────────────────────────────────────────

  const scrollEvents = window.filter((e) => e.event_type === 'scroll')
  const scrollSpeeds = scrollEvents.map((e) =>
    clamp01((e.scroll_speed ?? 0) / MAX_SCROLL_SPEED)
  )
  const avgScrollSpeed =
    scrollSpeeds.length > 0
      ? scrollSpeeds.reduce((a, b) => a + b, 0) / scrollSpeeds.length
      : window.some(isFastScroll)
        ? 0.65
        : 0

  const numScrolls = normalizeCount(scrollEvents.length, MAX_SCROLL_EVENTS)

  const watchTimes = window
    .filter((e) => e.event_type === 'watch' || e.event_type === 'view')
    .map((e) => e.watch_time ?? 0)
    .filter((t) => t > 0)
  const avgWatchTimeRaw =
    watchTimes.length > 0
      ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length
      : 0
  const avgWatchTime = clamp01(avgWatchTimeRaw / MAX_WATCH_TIME_SEC)

  const viewCount = window.filter(isType(VIEW_TYPES)).length
  const viewsPerSession = normalizeCount(viewCount, MAX_VIEWS_PER_SESSION)

  // ── Discovery ─────────────────────────────────────────────────────────────

  const categoryFreq = extractCategories(window)
  const uniqueCategories = Object.keys(categoryFreq).length
  const categoryTotal = Object.values(categoryFreq).reduce((a, b) => a + b, 0)
  const maxCategoryCount = Math.max(...Object.values(categoryFreq), 0)

  const categoryEntropy =
    uniqueCategories <= 1
      ? uniqueCategories === 0
        ? 0
        : 0
      : normalizedEntropy(categoryFreq)

  const numUniqueCategories = normalizeCount(
    uniqueCategories,
    MAX_UNIQUE_CATEGORIES
  )
  const categoryFocus =
    categoryTotal > 0 ? clamp01(maxCategoryCount / categoryTotal) : 0

  const categoryEvents = window.filter((e) => e.category?.trim())
  const switchRate =
    categoryEvents.length > 1
      ? countCategorySwitches(window) / (categoryEvents.length - 1)
      : 0
  const categorySwitchRate = clamp01(switchRate)

  // ── Deal ──────────────────────────────────────────────────────────────────

  const discountFlags = window.map(
    (e) =>
      e.event_type === 'discount_click' ||
      e.has_discount === true ||
      e.metadata?.has_discount === true
  )
  const discountRatio = weightedCount(discountFlags, weights)
  const hasDiscountInteraction =
    weightedCount(discountFlags, weights) > 0 ? 1 : 0

  const priceEvents = window.filter(
    (e) =>
      (e.event_type === 'click' || e.event_type === 'discount_click') &&
      typeof e.price === 'number' &&
      e.price > 0
  )
  const avgPriceRaw =
    priceEvents.length > 0
      ? priceEvents.reduce((sum, e) => sum + (e.price ?? 0), 0) /
        priceEvents.length
      : 0
  const avgPriceClicked = clamp01(avgPriceRaw / MAX_PRICE_TND)

  // ── Reengagement ──────────────────────────────────────────────────────────

  const itemClickCounts: Record<string, number> = {}
  for (const event of window) {
    if (!event.item_id || !CLICK_TYPES.includes(event.event_type)) continue
    itemClickCounts[event.item_id] = (itemClickCounts[event.item_id] ?? 0) + 1
  }
  const clickedItems = Object.keys(itemClickCounts)
  const repeatClicks = clickedItems.filter((id) => itemClickCounts[id]! > 1).length
  const repeatClickRate =
    clickedItems.length > 0
      ? clamp01(repeatClicks / clickedItems.length)
      : 0

  const revisitedItem =
    window.some((e) => e.event_type === 'revisit') ||
    repeatClicks > 0
      ? 1
      : 0

  // ── Meta ──────────────────────────────────────────────────────────────────

  const sessionDuration = clamp01(sessionDurationSec / MAX_SESSION_DURATION_SEC)
  const numEvents = normalizeCount(n, SLIDING_WINDOW_SIZE)

  const rawIntensity =
    window.reduce(
      (sum, e) => sum + (ACTION_STRENGTH[e.event_type] ?? 0.15),
      0
    ) / n
  const interactionIntensity = clamp01(rawIntensity)

  return {
    has_search: hasSearch,
    num_search_events: numSearchEvents,
    query_length: queryLength,
    num_filter_applied: numFilterApplied,
    click_rate: clickRate,
    interaction_rate: interactionRate,
    time_to_first_click: timeToFirstClick,
    clicks_per_view: clicksPerView,
    has_contact: hasContact,
    num_contact_events: numContactEvents,
    num_map_clicks: numMapClicks,
    location_used: locationUsed,
    time_to_first_action: timeToFirstAction,
    avg_scroll_speed: clamp01(avgScrollSpeed),
    num_scrolls: numScrolls,
    avg_watch_time: avgWatchTime,
    views_per_session: viewsPerSession,
    category_entropy: categoryEntropy,
    num_unique_categories: numUniqueCategories,
    category_focus: categoryFocus,
    category_switch_rate: categorySwitchRate,
    discount_ratio: discountRatio,
    has_discount_interaction: hasDiscountInteraction,
    avg_price_clicked: avgPriceClicked,
    repeat_click_rate: repeatClickRate,
    revisited_item: revisitedItem,
    session_duration: sessionDuration,
    num_events: numEvents,
    interaction_intensity: interactionIntensity,
  }
}
