import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOrder, getUserOrders, getStoreOrders } from '@/lib/actions/orders'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (storeId) {
      const storeIdNum = parseInt(storeId)
      if (isNaN(storeIdNum)) {
        return NextResponse.json({ error: 'Invalid storeId' }, { status: 400 })
      }

      // For vendors: check ownership
      const { data: store } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', storeIdNum)
        .single()

      if (!store || store.owner_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const data = await getStoreOrders(parseInt(storeId))
      return NextResponse.json(data)
    }

    // For customers
    const data = await getUserOrders(user.id)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    // createOrder handles auth check internally
    const result = await createOrder(data)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
