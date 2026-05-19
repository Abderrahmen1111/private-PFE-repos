'use server'

import { createClient } from '@/lib/supabase/server'

export type SupportTicket = {
  id: string;
  ticket_number: number;
  store_id: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone?: string | null;
  subject: string;
  description?: string | null;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  channel: 'chat' | 'phone';
  created_at: string;
  updated_at: string;
};

export async function getStoreTickets(storeId: number): Promise<SupportTicket[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    ...t,
    customer_phone: t.customer_phone || null // Assuming customer_phone might already be in the table or handled elsewhere
  })) as SupportTicket[];
}

export async function createSupportTicket(payload: {
  storeId: number;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  channel?: 'chat' | 'phone';
}): Promise<{ success: boolean; data?: SupportTicket; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  // Fetch full name from profile if available
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  const customerName = profile?.full_name || user.user_metadata?.full_name || 'Business Owner';

  // 1. Insert the support ticket
  const { data: ticketData, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({
      store_id: payload.storeId,
      subject: payload.subject,
      priority: payload.priority || 'medium',
      channel: payload.channel || 'chat',
      status: 'open',
      customer_id: user.id,
      customer_name: customerName
    } as any)
    .select()
    .single();

  if (ticketError) {
    console.error('Error creating support ticket:', ticketError);
    return { success: false, error: ticketError.message };
  }

  // 2. Insert the description as the first message in support_messages
  const { error: msgError } = await supabase
    .from('support_messages')
    .insert({
      ticket_id: ticketData.id,
      sender_id: user.id,
      sender_type: 'customer',
      content: payload.description,
      is_read: false
    } as any);

  if (msgError) {
    console.error('Error creating first ticket message:', msgError);
    // We don't fail the action if message insert fails, but it's good to log
  }

  return { success: true, data: ticketData as any };
}

export async function deleteTicket(
  ticketId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  const { error } = await supabase.from('support_tickets').delete().eq('id', ticketId);

  if (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateTicket(
  ticketId: string,
  payload: {
    subject: string;
    priority: SupportTicket['priority'];
    status: SupportTicket['status'];
  }
): Promise<{ success: boolean; data?: SupportTicket; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      subject: payload.subject,
      priority: payload.priority,
      status: payload.status,
    } as any)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as SupportTicket };
}

export async function getTicketMessages(ticketId: string): Promise<any[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === '42P01') return [];
    console.error('Error fetching ticket messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches regular messages for a store owner from customers.
 * This groups messages by sender to display as conversations in the dashboard.
 */
export async function getStoreCustomerMessages(storeId: number): Promise<any[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch all messages where the current user is either sender or receiver
    // We remove the strict chat_type='store' filter to catch customers who might reach out 
    // through regular profiles or search results.
    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
            receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching store customer messages:', error);
        return [];
    }

    // Group by partner (the person who is NOT the current user)
    const conversationMap = new Map();
    (data as any[]).forEach(msg => {
        const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!partner) return;
        
        // Filter by storeId: Only show messages belonging to THIS store
        const msgStoreId = msg.metadata?.store_id;
        if (Number(msgStoreId) !== Number(storeId)) return;

        if (!conversationMap.has(partner.id)) {
            conversationMap.set(partner.id, {
                id: partner.id,
                partner_name: partner.full_name,
                partner_avatar: partner.avatar_url,
                last_message: msg.content,
                last_message_at: msg.created_at,
                unread: !msg.is_read && msg.receiver_id === user.id,
                messages: []
            });
        }
    });

    return Array.from(conversationMap.values());
}

/**
 * Sends a message from a store owner to a specific customer.
 */
export async function sendStoreCustomerMessage(customerId: string, content: string, storeId: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non authentifié' };

    const { data, error } = await supabase
        .from('messages')
        .insert([{
            sender_id: user.id,
            receiver_id: customerId,
            content,
            type: 'text',
            is_read: false,
            metadata: { chat_type: 'store', store_id: storeId }
        }])
        .select()
        .single();

    if (error) {
        console.error('Error sending store customer message:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function sendTicketMessage(ticketId: string, content: string, senderType: 'customer' | 'support' = 'support') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  const { data, error } = await (supabase
    .from('support_messages') as any)
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      content,
      sender_type: senderType
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}