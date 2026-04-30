import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { subject, message } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Insert into a support_tickets or messages table
    // Adjust table name and fields according to actual schema
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: '00000000-0000-0000-0000-000000000000', // Assuming a static UUID for admin or support
          content: `[Support Ticket: ${subject} | Store: ${storeId}]\n\n${message}`
        }
      ])
      .select()
      .single()

    if (error) {
      console.warn('Could not insert support ticket:', error)
      return NextResponse.json({ error: 'Failed to submit support ticket' }, { status: 500 })
    }

    return NextResponse.json({ data, message: 'Support ticket submitted successfully' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
