import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeSalesDataWithGroq } from '@/lib/actions/sales-analyzer'

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    if (isNaN(storeId)) return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 })

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Fetch items for this store
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, name, price, view_count, order_count, booking_count, item_type, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (itemsError) {
      console.error('[SalesRec] Items fetch error:', itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Pas assez de données pour générer des recommandations'
      })
    }

    // 2. Fetch recent orders for conversion analysis
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, item_id, quantity, total_price, created_at, status')
      .eq('store_id', storeId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('[SalesRec] Orders fetch error:', ordersError)
      return NextResponse.json({ error: ordersError.message }, { status: 400 })
    }

    // 3. Fetch recent bookings for service analysis
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, item_id, price, created_at, status')
      .eq('store_id', storeId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.error('[SalesRec] Bookings fetch error:', bookingsError)
      return NextResponse.json({ error: bookingsError.message }, { status: 400 })
    }

    // 4. Prepare sales data for analysis
    const salesData = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.item_type,
        price: item.price,
        views: item.view_count || 0,
        sales: item.order_count || 0,
        bookings: item.booking_count || 0,
        viewToSaleRatio: (item.order_count || 0) > 0 ? ((item.view_count || 0) / (item.order_count || 0)).toFixed(2) : 'N/A'
      })),
      orders: orders?.map(o => ({
        itemId: o.item_id,
        quantity: o.quantity,
        price: o.total_price,
        date: o.created_at,
        status: o.status
      })) || [],
      bookings: bookings?.map(b => ({
        itemId: b.item_id,
        price: b.price,
        date: b.created_at,
        status: b.status
      })) || []
    }

    console.log(`[SalesRec] Store ${storeId}: Analyzing ${items.length} items, ${orders?.length || 0} orders, ${bookings?.length || 0} bookings`)

    // 5. Get AI recommendations
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Clé GROQ_API_KEY manquante dans votre fichier .env.local" 
      }, { status: 500 })
    }

    try {
      console.log('[SalesRec] Starting Groq analysis...')
      const recommendations = await analyzeSalesDataWithGroq(salesData, apiKey)
      console.log(`[SalesRec] Analysis complete. Got ${recommendations.length} recommendations`)
      
      return NextResponse.json({
        success: true,
        recommendations,
        summary: {
          totalItems: items.length,
          totalOrders: orders?.length || 0,
          totalBookings: bookings?.length || 0
        }
      })
    } catch (err: any) {
      console.error("[SalesRec] Groq analysis error:", err)
      return NextResponse.json({
        error: "L'IA Groq a retourné une erreur",
        details: err.message,
        code: err.statusCode || 500
      }, { status: 200 })
    }

  } catch (error: any) {
    console.error("[SalesRec] API Error:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
