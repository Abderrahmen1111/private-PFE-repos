import { create } from 'zustand'
import {
  coldStartIntentDefaults,
  getDominantIntent,
} from '@/lib/ranking/intent'
import type {
  BehavioralEvent,
  IntentMode,
  IntentProbabilities,
  ScoredItem,
} from '@/lib/ranking/types'

const SESSION_STORAGE_KEY = 'ro2ya_ranking_session_id'

export interface RankingState {
  // Intent state
  intentProbs: IntentProbabilities
  dominantIntent: IntentMode
  sessionId: string

  // Feed state
  feedItems: ScoredItem[]
  feedCursor: number
  hasMore: boolean

  // Event buffer
  eventBuffer: BehavioralEvent[]

  // Actions
  updateIntentProbs: (probs: IntentProbabilities) => void
  addEventToBuffer: (event: BehavioralEvent) => void
  flushEventBuffer: () => BehavioralEvent[]
  setFeedItems: (items: ScoredItem[]) => void
  appendFeedItems: (items: ScoredItem[]) => void
  resetFeed: () => void
  initSession: () => void
}

function createSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session'
  return crypto.randomUUID()
}

function dedupeFeedItems(items: ScoredItem[]): ScoredItem[] {
  return Array.from(
    new Map(items.map((item) => [`${item.type}:${item.id}`, item])).values()
  )
}

const initialState = {
  intentProbs: coldStartIntentDefaults(),
  dominantIntent: getDominantIntent(coldStartIntentDefaults()),
  sessionId: '',
  feedItems: [] as ScoredItem[],
  feedCursor: 0,
  hasMore: true,
  eventBuffer: [] as BehavioralEvent[],
}

export const useRankingStore = create<RankingState>((set, get) => ({
  ...initialState,

  updateIntentProbs: (probs) =>
    set({
      intentProbs: probs,
      dominantIntent: getDominantIntent(probs),
    }),

  addEventToBuffer: (event) =>
    set((state) => ({
      eventBuffer: [...state.eventBuffer, event],
    })),

  flushEventBuffer: () => {
    const events = get().eventBuffer
    set({ eventBuffer: [] })
    return events
  },

  setFeedItems: (items) =>
    set({
      feedItems: dedupeFeedItems(items),
    }),

  appendFeedItems: (items) =>
    set((state) => ({
      feedItems: dedupeFeedItems([...state.feedItems, ...items]),
    })),

  resetFeed: () =>
    set({
      feedItems: [],
      feedCursor: 0,
      hasMore: true,
    }),

  initSession: () => {
    if (typeof window === 'undefined') {
      set({ sessionId: 'ssr-session' })
      return
    }

    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionId) {
      sessionId = createSessionId()
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    }

    set({ sessionId })
  },
}))

/** Update pagination fields (used by feed hook; not part of public RankingState API). */
export function setFeedPagination(cursor: number, hasMore: boolean): void {
  useRankingStore.setState({ feedCursor: cursor, hasMore })
}
