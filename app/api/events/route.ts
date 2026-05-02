import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Only columns that exist in the events table — everything else is dropped
const ALLOWED_COLUMNS = new Set([
  'id',
  'session_id',
  'user_id',
  'surface',
  'page_path',
  'event_type',
  'created_at',
  'item_id',
  'merchant_id',
  'category_id',
  'search_query',
  'search_filters',
  'rank_position',
  'viewport_visibility_percentage',
  'scroll_depth_percentage',
  'dwell_time_ms',
  'reel_id',
  'reel_position',
  'reel_progress_percentage',
  'reel_playback_time_ms',
  'skip_reason',
  'like_type',
  'save_list_name',
  'share_platform',
  'profile_follow_type',
  'contact_method',
  'distance_to_item_km',
  'nearby_radius_km',
  'transaction_amount',
  'transaction_currency',
  'booking_id',
  'dismiss_reason',
  'hide_reason',
  'block_duration_days',
  'report_reason',
  'metadata',
])

function sanitizeEvent(raw: Record<string, any>) {
  const clean: Record<string, any> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (ALLOWED_COLUMNS.has(key) && value !== undefined) {
      clean[key] = value
    }
  }
  return clean
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Headers already sent — safe to ignore in Server Components
            }
          },
        },
      }
    )

    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Invalid events array' }, { status: 400 })
    }

    // Strip unknown fields so Supabase doesn't reject the insert
    const sanitized = events.map(sanitizeEvent)

    console.log('📝 Inserting', sanitized.length, 'event(s):', sanitized.map(e => e.event_type))

    const { data, error } = await supabase
      .from('events')
      .insert(sanitized)
      .select('id')

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({
        error: 'Supabase insert failed',
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }, { status: 500 })
    }

    console.log('✅ Inserted:', data?.map(d => d.id))
    return NextResponse.json({ success: true, count: sanitized.length })

  } catch (error: any) {
    console.error('❌ Events API error:', error)
    return NextResponse.json({
      error: 'Failed to ingest events',
      details: error?.message,
    }, { status: 500 })
  }
}