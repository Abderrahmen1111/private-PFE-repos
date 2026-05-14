import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * POST /api/notifications/push-token
 * Registers or updates a user's Expo push token for mobile push notifications.
 * Called by the mobile app after obtaining a push token from expo-notifications.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token, deviceId, platform } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'push token is required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upsert: one row per user+device, update token if device already registered
    const { error } = await supabaseAdmin
      .from('user_push_tokens')
      .upsert(
        {
          user_id: user.id,
          token,
          device_id: deviceId || null,
          platform: platform || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, device_id' }
      )

    if (error) {
      console.error('[Push Token] Upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Push Token] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/notifications/push-token
 * Removes a push token on logout so the device no longer receives notifications.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deviceId } = await request.json().catch(() => ({}))

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const query = supabaseAdmin
      .from('user_push_tokens')
      .delete()
      .eq('user_id', user.id)

    if (deviceId) {
      query.eq('device_id', deviceId)
    }

    const { error } = await query

    if (error) {
      console.error('[Push Token] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
