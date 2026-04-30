import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
            } catch (error) {
              // Handle error
            }
          },
        },
      }
    )
    
    const { events } = await request.json()

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Invalid events array' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('events')
      .insert(events)
      .select('id')

    if (error) throw error

    return NextResponse.json({ success: true, count: events.length })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json({ error: 'Failed to ingest events' }, { status: 500 })
  }
}