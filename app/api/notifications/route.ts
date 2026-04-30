import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/lib/actions/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const countOnly = searchParams.get('countOnly') === 'true'

  try {
    if (countOnly) {
      const count = await getUnreadCount()
      return NextResponse.json({ count })
    }

    const result = await getNotifications(limit)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, all } = await request.json()

    if (all) {
      const result = await markAllAsRead()
      return NextResponse.json(result)
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })
    }

    const result = await markAsRead(notificationId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
