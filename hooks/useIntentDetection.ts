'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRankingStore } from '@/store/rankingStore'
import { updateIntentScores, getDominantIntent, coldStartIntentDefaults } from '@/lib/ranking/intent'
import type { EventType, IntentProbabilities, IntentMode } from '@/lib/ranking/types'

interface UseIntentDetectionReturn {
  intentProbs: IntentProbabilities
  dominantIntent: IntentMode
  confidence: number
  updateIntent: (eventType: EventType) => void
  resetIntent: () => void
}

export function useIntentDetection(): UseIntentDetectionReturn {
  const {
    intentProbs,
    sessionId,
    updateIntentProbs,
  } = useRankingStore()

  // Ref to avoid stale closure in event handlers
  const intentRef = useRef<IntentProbabilities>(intentProbs)
  intentRef.current = intentProbs

  // Sync with server on mount
  useEffect(() => {
    if (!sessionId) return

    const syncFromServer = async () => {
      try {
        const res = await fetch(
          `/api/ranking/intent?session_id=${sessionId}`,
          { method: 'GET' }
        )
        if (!res.ok) return

        const data = await res.json()
        if (data?.intent_probs) {
          updateIntentProbs(data.intent_probs)
        }
      } catch {
        // Silent fail — use local state
      }
    }

    syncFromServer()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update intent locally + notify server (fire-and-forget)
  const updateIntent = useCallback((eventType: EventType) => {
    const current = intentRef.current

    // Local update (instant, no network wait)
    const updated = updateIntentScores(current, eventType, 0.8)
    updateIntentProbs(updated)

    // Server sync (non-blocking)
    fetch('/api/ranking/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType }),
    }).catch(() => {
      // Silent fail — local state is source of truth
    })
  }, [updateIntentProbs])

  const resetIntent = useCallback(() => {
    updateIntentProbs(coldStartIntentDefaults())
  }, [updateIntentProbs])

  // Compute confidence = max probability
  const confidence = Math.max(...Object.values(intentProbs))
  const dominantIntent = getDominantIntent(intentProbs)

  return {
    intentProbs,
    dominantIntent,
    confidence,
    updateIntent,
    resetIntent,
  }
}