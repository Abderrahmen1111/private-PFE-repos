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

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    // Fetch messages for this store
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
        receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url)
      `)
      .eq('metadata->>store_id', storeId.toString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Group into conversations
    const conversationMap = new Map<string, any>()

    ;(messages || []).forEach(msg => {
      // The partner is the other user (not the current logged-in store owner)
      const partner = msg.sender_id === user.id ? msg.receiver : msg.sender
      if (!partner) return

      if (!conversationMap.has(partner.id)) {
        conversationMap.set(partner.id, {
          id: partner.id,
          partner_name: partner.full_name || 'Utilisateur',
          partner_avatar: partner.avatar_url || '',
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread: !msg.is_read && msg.receiver_id === user.id,
          messages: []
        })
      }
    })

    const conversations = Array.from(conversationMap.values())
    return NextResponse.json(conversations)

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

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id, email')
      .eq('id', storeId)
      .single()

    if (storeError || !store || (store.owner_id !== user.id && store.email !== user.email)) {
      return NextResponse.json({ error: 'Store not found or forbidden' }, { status: 403 })
    }

    const { receiverId, content } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Missing receiverId or content' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        type: 'text',
        is_read: false,
        metadata: { chat_type: 'store', store_id: storeId }
      }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Message sent successfully' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
