'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncOrderTransaction } from './transactions';

/**
 * Fetch all leads (orders and bookings) for a specific store
 */
export async function getLeadActions(storeId: number) {
    const supabase = createClient()
    
    // Get orders with item details and fraud signals
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id, 
            order_number,
            customer_id,
            customer_name, 
            customer_phone,
            customer_email,
            delivery_address,
            customer_notes,
            quantity,
            unit_price,
            total_price, 
            status,
            created_at,
            items (
                id,
                name,
                main_image
            ),
            fraud:order_fraud_checks (
                score,
                level,
                recommendation,
                ai_reasoning,
                signals
            )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50)
    
    // Get bookings with item details and fraud signals
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id, 
            booking_number,
            customer_id,
            customer_name, 
            customer_phone,
            customer_email,
            booking_date,
            start_time,
            end_time,
            notes,
            price, 
            status,
            created_at,
            items (
                id,
                name,
                main_image
            ),
            fraud:booking_fraud_checks (
                score,
                level,
                recommendation,
                ai_reasoning,
                signals
            )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50)
    
    return { orders: orders || [], bookings: bookings || [] }
}

/**
 * Update the status of an order
 * Used when owner validates a PENDING order (changes to VALIDATED)
 * Generates tracking code for QR scanning
 */
export async function updateOrderStatus(
    orderId: number,
    status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
) {
    const supabase = createClient()
    
    const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
    }
    
    // Generate tracking code for QR scanning when validating
    if (status === 'VALIDATED') {
        updateData.validated_at = new Date().toISOString()
        const trackingCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`
        updateData.tracking_code = trackingCode
    }
    
    if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await (supabase
        .from('orders') as any)
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

    if (error || !data) {
        console.error('Error updating order status:', error)
        throw new Error(error?.message || 'Données introuvables')
    }

    revalidatePath(`/dashboard/${(data as any).store_id}/leads`)
    revalidatePath(`/dashboard/${(data as any).store_id}/transactions`)
    
    if (data && (status === 'VALIDATED' || status === 'COMPLETED' || status === 'CANCELLED')) {
        // Only sync if it's being validated or was already validated
        await syncOrderTransaction(data, supabase);
    }
    
    return data
}

/**
 * Get orders filtered by status for a store
 */
export async function getOrdersByStatus(storeId: number, status: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            items (
                id,
                name,
                main_image
            )
        `)
        .eq('store_id', storeId)
        .eq('status', status as any)
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('Error fetching orders:', error)
        return []
    }
    
    return data || []
}
