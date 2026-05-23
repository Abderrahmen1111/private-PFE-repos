'use client'

import { useState } from 'react'
import { RankedFeed } from '@/components/feed/RankedFeed'
import { useIntentDetection } from '@/hooks/useIntentDetection'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import type { ItemType, EventType } from '@/lib/ranking/types'

// ── Intent probability bar ───────────────────────────────────
function IntentBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-right text-xs text-gray-500">
        {label}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="w-8 text-xs font-mono text-gray-700">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

// ── Main test page ────────────────────────────────────────────
export default function TestRankingPage() {
  const [query, setQuery]           = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([])
  const [apiResponse, setApiResponse] = useState<string>('')
  const [isTestingApi, setIsTestingApi] = useState(false)

  const { intentProbs, dominantIntent, updateIntent } = useIntentDetection()
  const { track, trackSearch, trackScroll } = useTrackEvent()

  const INTENT_COLORS: Record<string, string> = {
    SEARCH:       'bg-blue-500',
    DISCOVERY:    'bg-purple-500',
    PROBLEM:      'bg-red-500',
    PASSIVE:      'bg-gray-400',
    DEAL:         'bg-green-500',
    REENGAGEMENT: 'bg-amber-500',
    TRANSACTION:  'bg-emerald-500',
  }

  const TYPE_OPTIONS: ItemType[] = ['business', 'product', 'service', 'reel']

  const EVENT_BUTTONS: { label: string; event: EventType; color: string }[] = [
    { label: '🔍 Search',       event: 'search',         color: 'bg-blue-500' },
    { label: '📞 Contact',      event: 'contact',        color: 'bg-red-500' },
    { label: '🗺️ Map click',   event: 'map_click',      color: 'bg-orange-500' },
    { label: '🏷️ Category',    event: 'category_click', color: 'bg-purple-500' },
    { label: '⚡ Fast scroll',  event: 'scroll',         color: 'bg-gray-500' },
    { label: '💰 Discount',     event: 'discount_click', color: 'bg-green-500' },
    { label: '❤️ Save',         event: 'save',           color: 'bg-pink-500' },
    { label: '🔄 Revisit',      event: 'revisit',        color: 'bg-amber-500' },
    { label: '🛒 Purchase',     event: 'purchase',       color: 'bg-emerald-500' },
  ]

  // Test API directly
  const testFeedApi = async () => {
    setIsTestingApi(true)
    setApiResponse('')
    try {
      const params = new URLSearchParams()
      params.set('limit', '6')
      params.set('offset', '0')
      if (activeQuery) params.set('query', activeQuery)
      if (selectedTypes.length) params.set('types', selectedTypes.join(','))

      const res = await fetch(`/api/ranking/feed?${params}`)
      const data = await res.json()

      setApiResponse(JSON.stringify({
        status:   res.status,
        count:    data.items?.length ?? 0,
        intent:   data.dominant_intent,
        top3:     data.items?.slice(0, 3).map((i: {
          id: string
          title: string
          type: string
          final_score: number
        }) => ({
          id:    i.id,
          title: i.title,
          type:  i.type,
          score: i.final_score?.toFixed(4),
        })),
      }, null, 2))
    } catch (err) {
      setApiResponse(`ERROR: ${err}`)
    } finally {
      setIsTestingApi(false)
    }
  }

  const testIntentApi = async () => {
    setIsTestingApi(true)
    try {
      const res = await fetch('/api/ranking/intent')
      const data = await res.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      setApiResponse(`ERROR: ${err}`)
    } finally {
      setIsTestingApi(false)
    }
  }

  const testEventApi = async (eventType: EventType) => {
    try {
      const res = await fetch('/api/events/track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          session_id: sessionStorage.getItem('ro2ya_session_id') ?? 'test-session',
          metadata:   { source: 'test-page' },
        }),
      })
      const data = await res.json()
      setApiResponse(JSON.stringify({ event: eventType, response: data }, null, 2))
    } catch (err) {
      setApiResponse(`ERROR: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            🧪 Ranking System — Test Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Testez le système de ranking en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── LEFT PANEL — Controls ── */}
          <div className="space-y-5 lg:col-span-1">

            {/* Intent State */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  🧠 Intent State
                </h2>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  {dominantIntent}
                </span>
              </div>

              <div className="space-y-2">
                {(Object.entries(intentProbs) as [string, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([mode, prob]) => (
                    <IntentBar
                      key={mode}
                      label={mode}
                      value={prob}
                      color={INTENT_COLORS[mode] ?? 'bg-gray-400'}
                    />
                  ))}
              </div>
            </div>

            {/* Simulate Events */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">
                ⚡ Simuler des événements
              </h2>
              <p className="mb-3 text-xs text-gray-400">
                Cliquez pour simuler un comportement utilisateur
                et observer le changement d&apos;intention.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_BUTTONS.map(({ label, event, color }) => (
                  <button
                    key={event}
                    onClick={() => {
                      updateIntent(event)
                      testEventApi(event)
                    }}
                    className={`
                      rounded-xl px-3 py-2 text-xs font-medium
                      text-white transition active:scale-95
                      ${color} hover:opacity-90
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">
                🔍 Recherche & Filtres
              </h2>

              {/* Query input */}
              <input
                type="text"
                placeholder="Tapez une requête..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="
                  mb-3 w-full rounded-xl border border-gray-200
                  px-3 py-2 text-sm outline-none
                  focus:border-purple-400 focus:ring-2
                  focus:ring-purple-100
                "
              />

              {/* Type filter */}
              <div className="mb-3 flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedTypes((prev) =>
                        prev.includes(type)
                          ? prev.filter((t) => t !== type)
                          : [...prev, type]
                      )
                    }
                    className={`
                      rounded-full border px-3 py-1 text-xs
                      font-medium transition
                      ${selectedTypes.includes(type)
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Apply search */}
              <button
                onClick={() => {
                  setActiveQuery(query)
                  if (query) {
                    trackSearch(query.length, undefined)
                    updateIntent('search')
                  }
                }}
                className="
                  w-full rounded-xl bg-gray-900 py-2
                  text-sm font-medium text-white
                  transition hover:bg-gray-700 active:scale-95
                "
              >
                Appliquer les filtres
              </button>
            </div>

            {/* API Tester */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">
                🔌 Test API direct
              </h2>

              <div className="mb-3 space-y-2">
                <button
                  onClick={testFeedApi}
                  disabled={isTestingApi}
                  className="
                    w-full rounded-xl bg-blue-600 py-2
                    text-sm font-medium text-white
                    transition hover:bg-blue-700
                    disabled:opacity-50 active:scale-95
                  "
                >
                  {isTestingApi ? '⏳ Loading...' : 'GET /api/ranking/feed'}
                </button>
                <button
                  onClick={testIntentApi}
                  disabled={isTestingApi}
                  className="
                    w-full rounded-xl bg-purple-600 py-2
                    text-sm font-medium text-white
                    transition hover:bg-purple-700
                    disabled:opacity-50 active:scale-95
                  "
                >
                  GET /api/ranking/intent
                </button>
              </div>

              {/* API Response */}
              {apiResponse && (
                <pre className="
                  max-h-48 overflow-auto rounded-xl
                  bg-gray-900 p-3 text-[10px]
                  leading-relaxed text-green-400
                ">
                  {apiResponse}
                </pre>
              )}
            </div>

          </div>

          {/* ── RIGHT PANEL — Live Feed ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  📱 Feed en temps réel
                </h2>
                <span className="text-xs text-gray-400">
                  Mode: <strong>{dominantIntent}</strong>
                </span>
              </div>

              <RankedFeed
                query={activeQuery || undefined}
                types={selectedTypes.length ? selectedTypes : undefined}
                pageSize={6}
                showIntentDebug={true}
              />
            </div>
          </div>

        </div>

        {/* ── Bottom — Supabase Debug ── */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">
            🗄️ Vérifications Supabase (copier dans SQL Editor)
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              {
                title: 'Events récents',
                sql: `SELECT event_type, COUNT(*)
FROM events
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type
ORDER BY COUNT(*) DESC;`,
              },
              {
                title: 'Intent states',
                sql: `SELECT
  dominant_intent,
  ROUND(p_discovery::numeric, 2) as discovery,
  ROUND(p_search::numeric, 2) as search,
  ROUND(p_problem::numeric, 2) as problem,
  updated_at
FROM user_intent_state
ORDER BY updated_at DESC
LIMIT 5;`,
              },
              {
                title: 'Top scored items',
                sql: `SELECT
  item_id,
  item_type,
  ROUND(engagement_score::numeric, 3) as eng,
  ROUND(quality_score::numeric, 3) as qual,
  total_views,
  total_likes
FROM item_ranking_scores
ORDER BY engagement_score DESC
LIMIT 10;`,
              },
            ].map(({ title, sql }) => (
              <div key={title}>
                <p className="mb-1 text-xs font-medium text-gray-600">
                  {title}
                </p>
                <pre
                  onClick={() => navigator.clipboard.writeText(sql)}
                  title="Cliquer pour copier"
                  className="
                    cursor-pointer overflow-auto rounded-xl
                    bg-gray-900 p-3 text-[10px]
                    leading-relaxed text-blue-300
                    hover:opacity-80
                  "
                >
                  {sql}
                </pre>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}