import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLatestItems, upsertItem } from '@/lib/actions/items'
import { searchItems } from '@/lib/actions/search_items'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    if (query || category) {
      const { data, error } = await searchItems(query || undefined, category || undefined)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json(data)
    }

    const data = await getLatestItems(limit)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is PRO or ADMIN
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['PRO', 'ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER'].includes(profile.role?.toUpperCase())) {
      return NextResponse.json({ error: 'Forbidden: Professional account required' }, { status: 403 })
    }

    const itemData = await request.json()
    const { data, error } = await upsertItem(itemData)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data, message: 'Item created/updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
