import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data: promotions, error } = await supabase
      .from('promotions')
      .select(`
        *,
        stores (
          id,
          name,
          logo_url,
          city,
          category
        )
      `)
      .eq('active', true)
      .gte('valid_until', now)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching public promotions:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(promotions || [])
  } catch (error: any) {
    console.error('API Error in public promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
