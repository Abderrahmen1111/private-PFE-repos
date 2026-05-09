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

    const { data: promotions, error } = await supabase
      .from('promotions')
      .select(`
        *,
        promotion_items (
          item_id
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const formattedPromos = (promotions || []).map((p: any) => ({
      ...p,
      item_ids: p.promotion_items?.map((pi: any) => pi.item_id) || []
    }))

    return NextResponse.json(formattedPromos)
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    if (isNaN(storeId)) return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 })

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const newPromotion = { ...body, store_id: storeId }

    const { data, error } = await supabase
      .from('promotions')
      .insert([newPromotion])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Promotion created successfully' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    const { id, ...updates } = await request.json()

    // Ownership check
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Promotion updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing promotion ID' }, { status: 400 })

    // Ownership check
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }
    const promoId = parseInt(id, 10)
    if (isNaN(promoId)) return NextResponse.json({ error: 'Invalid promotion ID' }, { status: 400 })

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', promoId)
      .eq('store_id', storeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'Promotion deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
