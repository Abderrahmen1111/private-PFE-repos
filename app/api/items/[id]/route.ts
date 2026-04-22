import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getProductById, getProductReviews, getRelatedItems } from '@/lib/actions/product_detail'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const item = await getProductById(id)
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const reviews = await getProductReviews(id)
    const relatedItems = await getRelatedItems(item.store.id, id)

    return NextResponse.json({
      item,
      reviews,
      relatedItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
