import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    const productId = parseInt(params.productId)
    if (isNaN(storeId) || isNaN(productId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const updates = await request.json()
    delete updates.id
    delete updates.store_id // Prevent moving the product to another store

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', productId)
      .eq('store_id', storeId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Product updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    const productId = parseInt(params.productId)
    if (isNaN(storeId) || isNaN(productId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', productId)
      .eq('store_id', storeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
