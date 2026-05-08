import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { searchStores } from '@/lib/actions/search'
import { updateStoreProfile } from '@/lib/actions/stores'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''

  try {
    const results = await searchStores(query, location)
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ...data } = await request.json()
    
    // Security check: Verify ownership
    const { data: store } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { success, error } = await updateStoreProfile(id, data)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Store updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
