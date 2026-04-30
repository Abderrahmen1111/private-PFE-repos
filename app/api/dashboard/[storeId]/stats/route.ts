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

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch stats
    // Note: These are example queries, adapt to exact schema if needed
    const [
      { count: productsCount },
      { count: ordersCount },
      { count: reviewsCount }
    ] = await Promise.all([
      supabase.from('items').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('store_id', storeId)
    ])

    const stats = {
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0,
      totalReviews: reviewsCount || 0,
      totalRevenue: 0, // Placeholder for actual revenue calculation
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching store stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
