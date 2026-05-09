import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Unified ownership check: owner_id OR email
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    // Fetch leads (orders and bookings)
    const [
      { data: orders, error: ordersError },
      { data: bookings, error: bookingsError }
    ] = await Promise.all([
      supabase.from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').eq('store_id', storeId).order('created_at', { ascending: false })
    ]);

    if (ordersError || bookingsError) {
      return NextResponse.json({ error: (ordersError || bookingsError)?.message }, { status: 400 });
    }

    return NextResponse.json({
      orders: orders || [],
      bookings: bookings || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
