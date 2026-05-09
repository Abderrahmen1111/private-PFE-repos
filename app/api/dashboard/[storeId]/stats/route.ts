import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeId = parseInt(params.storeId)
    if (isNaN(storeId)) {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 })
    }

    // Unified ownership check: owner_id OR email
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (store.owner_id !== user.id && store.email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch stats
    const [
      { count: productsCount },
      { count: ordersCount },
      { count: reviewsCount },
      { data: impressions }
    ] = await Promise.all([
      supabase.from('items').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('store_analytics').select('profile_views, phone_clicks, direction_requests').eq('store_id', storeId).maybeSingle()
    ])

    const stats = {
      totalProducts: productsCount || 0,
      totalActions: ordersCount || 0,
      totalReviews: reviewsCount || 0,
      totalRevenue: 0, 
      profileViews: impressions?.profile_views || 0,
      phoneClicks: impressions?.phone_clicks || 0,
      directionRequests: impressions?.direction_requests || 0
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching store stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
