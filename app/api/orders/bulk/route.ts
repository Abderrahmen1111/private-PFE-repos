import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/orders'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customerInfo } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      return NextResponse.json({ error: 'Missing customer information' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = []
    const errors = []

    // We process orders sequentially to avoid race conditions on order number generation if any
    // and to handle individual errors gracefully
    for (const item of items) {
      try {
        const orderResult = await createOrder({
          store_id: item.store_id,
          item_id: item.id,
          quantity: item.quantity,
          unit_price: item.discountedPrice || item.price,
          total_price: (item.discountedPrice || item.price) * item.quantity,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          delivery_address: customerInfo.address,
          customer_notes: customerInfo.notes || '',
          customer_email: user.email || ''
        })
        results.push(orderResult)
      } catch (err: any) {
        console.error(`Error creating order for item ${item.id}:`, err.message)
        errors.push({ itemId: item.id, error: err.message })
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      results,
      errors,
      message: results.length > 0 
        ? `${results.length} commandes créées avec succès.` 
        : 'Échec de la création des commandes.'
    })

  } catch (error: any) {
    console.error('Bulk checkout error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
