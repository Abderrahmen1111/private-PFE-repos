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
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
};

export async function getStoreTickets(storeId: number): Promise<SupportTicket[]> {
  const supabase = createClient();
  
  // Attempt with join first
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      customer:users(phone)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets with join:', error);
    
    // Fallback to simple select if join fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (fallbackError) {
      console.error('Error fetching tickets fallback:', fallbackError);
      return [];
    }
    
    return (fallbackData || []).map((t: any) => ({
      ...t,
      customer_phone: null
    }));
  }

  // Flatten the customer phone into the ticket object
  return (data || []).map((ticket: any) => ({
    ...ticket,
    customer_phone: (ticket.customer as any)?.phone || null
  }));
}

export async function createSupportTicket(payload: {
  storeId: number;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}): Promise<{ success: boolean; data?: SupportTicket; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      store_id: payload.storeId,
      subject: payload.subject,
      priority: payload.priority || 'medium',
      status: 'open',
      customer_name: 'Business Owner' // Default for owner-created tickets
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
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