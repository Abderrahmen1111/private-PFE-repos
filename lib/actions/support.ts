'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Types based on the SQL schema
export type SupportTicket = {
    id: string
    ticket_number: number
    store_id: number
    customer_id: string | null
    customer_name: string | null
    subject: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved'
    channel: 'email' | 'chat' | 'phone' | 'social'
    assigned_to: string | null
    created_at: string
    updated_at: string
    last_reply_at: string
}

export type SupportMessage = {
    id: string
    ticket_id: string
    sender_id: string | null
    sender_type: 'customer' | 'support'
    content: string
    is_read: boolean
    created_at: string
}

/**
 * Fetch all tickets for a specific store
 */
export async function getTickets(storeId: number) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('store_id', storeId)
        .order('last_reply_at', { ascending: false })

    if (error) {
        console.error('Error fetching tickets:', error)
        return { error: error.message }
    }

    return { data: data as SupportTicket[] }
}

/**
 * Fetch a single ticket by ID with its messages
 */
export async function getTicketById(ticketId: string) {
    const supabase = createClient() as any

    const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

    if (ticketError) {
        console.error('Error fetching ticket:', ticketError)
        return { error: ticketError.message }
    }

    const { data: messages, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return { error: messagesError.message }
    }

    return { 
        data: { 
            ...ticket as SupportTicket, 
            messages: messages as SupportMessage[] 
        } 
    }
}

/**
 * Create a new support ticket
 */
export async function createTicket(data: Partial<SupportTicket>) {
    const supabase = createClient() as any

    const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert([data])
        .select()
        .single()

    if (error) {
        console.error('Error creating ticket:', error)
        return { error: error.message }
    }

    revalidatePath(`/dashboard/${data.store_id}/support/tickets`)
    return { data: ticket as SupportTicket }
}

/**
 * Update ticket status or priority
 */
export async function updateTicket(ticketId: string, storeId: number, updates: Partial<SupportTicket>) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)

    if (error) {
        console.error('Error updating ticket:', error)
        return { error: error.message }
    }

    revalidatePath(`/dashboard/${storeId}/support/tickets`)
    revalidatePath(`/dashboard/${storeId}/support/chat`)
    return { success: true }
}

/**
 * Send a message in a ticket
 */
export async function sendMessage(ticketId: string, storeId: number, content: string, senderType: 'support' | 'customer') {
    const supabase = createClient() as any

    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
        .from('support_messages')
        .insert([{
            ticket_id: ticketId,
            sender_id: user?.id,
            sender_type: senderType,
            content: content
        }])
        .select()
        .single()

    if (error) {
        console.error('Error sending message:', error)
        return { error: error.message }
    }

    revalidatePath(`/dashboard/${storeId}/support/chat`)
    return { data: data as SupportMessage }
}