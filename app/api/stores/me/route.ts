import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch stores by owner_id OR email
    // We use a single query with .or() for efficiency
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, slug, city, category, logo_url, status, email, owner_id')
      .or(`owner_id.eq.${user.id},email.eq.${user.email}`)
      .order('created_at', { ascending: false })

    if (storesError) {
      console.error('Error fetching user stores:', storesError)
      return NextResponse.json({ error: storesError.message }, { status: 500 })
    }

    // 3. Return the list
    return NextResponse.json(stores || [])
  } catch (error: any) {
    console.error('API Error in stores/me:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
