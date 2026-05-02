import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies() // IMPORTANT: await is required in Next.js 15+
    
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
              // This can be ignored if you have middleware refreshing sessions
            }
          },
        },
      }
    )
    
    const { sessionId, device, platform, userId } = await request.json()
    
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('sessions')
      .upsert({
        id: sessionId,
        user_id: userId || null,
        device: device,
        platform: platform,
        started_at: now,
        updated_at: now
      }, {
        onConflict: 'id'
      })
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies() // IMPORTANT: await is required in Next.js 15+
    
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
              // This can be ignored if you have middleware refreshing sessions
            }
          },
        },
      }
    )
    
    const { sessionId } = await request.json()
    
    const { error } = await supabase
      .from('sessions')
      .update({ 
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session PUT error:', error)
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
  }
}