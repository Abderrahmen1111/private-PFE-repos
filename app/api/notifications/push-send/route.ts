import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export interface PushPayload {
  userId: string
  title: string
  body: string
  data?: Record<string, any>
  sound?: 'default' | null
  badge?: number
  channelId?: string   // Android channel
  priority?: 'default' | 'normal' | 'high'
}

/**
 * POST /api/notifications/push-send
 * Internal server-to-server endpoint to trigger a push notification.
 * Should be called from server actions / cron jobs — NOT exposed publicly.
 * Requires the CRON_SECRET header for protection.
 */
export async function POST(request: Request) {
  // Protect with a simple shared secret (set CRON_SECRET in env)
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const payload: PushPayload = await request.json()
    const result = await sendPushNotificationToUser(payload)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Push Send] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Sends a push notification to all registered devices for a given userId.
 * Can be imported and called from server actions.
 */
export async function sendPushNotificationToUser(payload: PushPayload) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get all push tokens for this user
  const { data: tokens, error } = await supabaseAdmin
    .from('user_push_tokens')
    .select('token')
    .eq('user_id', payload.userId)

  if (error) {
    console.error('[Push Send] Failed to fetch tokens:', error)
    return { success: false, error: error.message }
  }

  if (!tokens || tokens.length === 0) {
    return { success: true, message: 'No push tokens for user — skipped' }
  }

  // 2. Build Expo push messages
  const messages = tokens.map((row) => ({
    to: row.token,
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
    sound: payload.sound ?? 'default',
    badge: payload.badge,
    channelId: payload.channelId || 'default',
    priority: payload.priority || 'high',
  }))

  // 3. Send to Expo Push Gateway (batched in chunks of 100)
  const results: any[] = []
  const chunkSize = 100
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize)
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(process.env.EXPO_ACCESS_TOKEN
          ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(chunk),
    })

    const json = await response.json()
    results.push(...(json.data || []))
  }

  console.log(`[Push Send] Sent to ${tokens.length} device(s) for user ${payload.userId}`)
  return { success: true, results }
}
