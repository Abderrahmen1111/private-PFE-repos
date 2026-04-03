'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';

export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];

/**
 * Create a new order
 * Called when user clicks "Order" on a product page
 */
export async function createOrder(data: Omit<OrderInsert, 'order_number' | 'status' | 'customer_id'>) {
  const supabase = createClient();
  
  // Get current session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Vous devez être connecté pour commander.');
  }

  // Generate a unique order number: ORD-XXXXXX-XXXX
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data: order, error } = await (supabase
    .from('orders') as any)
    .insert({
      ...data,
      customer_id: user.id,
      order_number: orderNumber,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(`Erreur lors de la commande : ${error.message}`);
  }

  revalidatePath(`/merchants/business/${data.store_id}`);
  return { success: true, order };
}

/**
 * Get all orders for a specific customer (user)
 * Displayed in user profile under "Commands" section
 */
export async function getUserOrders(customerId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      stores (
        id,
        name,
        logo_url,
        banner_url,
        category,
        owner_id
      ),
      items (
        id,
        name,
        main_image,
        price
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw new Error(error.message);
  }

  // Filter out orders without store data (deleted stores)
  const validOrders = (data || []).filter((order: any) => order.stores != null);
  
  return validOrders as any[];
}

/**
 * Get all orders for a specific store
 * Used for filtering PENDING orders for leads and VALIDATED for transactions
 */
export async function getStoreOrders(storeId: number, status?: string) {
  const supabase = createClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      items (
        id,
        name,
        main_image
      )
    `)
    .eq('store_id', storeId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching store orders:', error);
    throw new Error(error.message);
  }

  return data as any[];
}

/**
 * Get pending orders for a specific store
 * Used in dashboard /dashboard/[id]/leads page
 * Only shows PENDING orders (waiting for owner validation)
 */
export async function getPendingOrdersForStore(storeId: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items (
        id,
        name,
        main_image,
        price
      )
    `)
    .eq('store_id', storeId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending orders:', error);
    throw new Error(error.message);
  }

  return data as any[];
}

/**
 * Validate order by owner
 * Changes status from PENDING to VALIDATED
 * This is when owner accepts the order in the leads page
 * Also generates a tracking code (QR token)
 */
export async function validateOrder(orderId: number) {
  const supabase = createClient();

  // Generate a unique tracking code for QR scanning
  const trackingCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;

  const { data, error } = await (supabase
    .from('orders') as any)
    .update({
      status: 'VALIDATED',
      tracking_code: trackingCode,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error validating order:', error);
    throw new Error(error.message);
  }

  // Revalidate both dashboard and user profile
  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);

  return data;
}

/**
 * Update order status
 * Used when owner scans QR code
 * Can change status to COMPLETED, CANCELLED, or handle FAILED
 */
export async function updateOrderStatus(
  orderId: number,
  status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
) {
  const supabase = createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Helper to update timestamps based on status
  if (status === 'VALIDATED') updateData.validated_at = new Date().toISOString();
  if (status === 'COMPLETED') updateData.completed_at = new Date().toISOString();

  const { data, error } = await (supabase
    .from('orders') as any)
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error(error.message);
  }

  // Revalidate affected pages
  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);

  return data;
}

/**
 * Cancel order
 * Changes status to CANCELLED
 * Can be called by customer or owner
 */
export async function cancelOrder(orderId: number, reason?: string) {
  const supabase = createClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .update({
      status: 'CANCELLED',
      vendor_notes: reason || 'Commande annulée',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling order:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);

  return data;
}

/**
 * Get order by tracking code (QR token)
 * Used to retrieve order details when QR code is scanned
 */
export async function getOrderByTrackingCode(trackingCode: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      stores (
        id,
        name,
        owner_id
      ),
      items (
        id,
        name,
        main_image
      )
    `)
    .eq('tracking_code', trackingCode)
    .eq('status', 'VALIDATED')
    .single();

  if (error) {
    console.error('Error fetching order by tracking code:', error);
    throw new Error('Commande non trouvée ou déjà livrée');
  }

  return data as any;
}

/**
 * Mark order as delivered via QR scan
 * Called when owner scans the QR code with status "SUCCESS"
 * Changes status from VALIDATED to COMPLETED
 */
export async function markOrderAsDelivered(orderId: number) {
  const supabase = createClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error marking order as delivered:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);

  return data;
}

/**
 * Mark order as failed via QR scan
 * Called when owner scans the QR code with status "FAILED"
 * Could change status back to VALIDATED or create a refund
 */
export async function markOrderAsFailed(orderId: number, reason?: string) {
  const supabase = createClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .update({
      status: 'CANCELLED', // Or you could add a new status like 'FAILED'
      vendor_notes: reason || 'Livraison échouée',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error marking order as failed:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);

  return data;
}

/**
 * Validate order by QR scan
 * This is the main function called when scanning QR code
 * Returns success or failure based on scan result
 */
export async function validateOrderByQR(trackingCode: string, scanResult: 'success' | 'failed') {
  const supabase = createClient();

  // Get the order
  const order = await getOrderByTrackingCode(trackingCode);

  if (!order) {
    throw new Error('Commande non trouvée');
  }

  if (scanResult === 'success') {
    return await markOrderAsDelivered(order.id);
  } else {
    return await markOrderAsFailed(order.id);
  }
}

/**
 * Get all validated orders for a store (for transactions page)
 * Shows orders that have been accepted and are waiting for delivery
 */
export async function getValidatedOrdersForStore(storeId: number) {
  const supabase = createClient();

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
    .eq('status', 'VALIDATED')
    .order('validated_at', { ascending: false });

  if (error) {
    console.error('Error fetching validated orders:', error);
    throw new Error(error.message);
  }

  return data as any[];
}

/**
 * Update order vendor notes
 * Owner can add notes to the order
 */
export async function updateOrderVendorNotes(orderId: number, notes: string) {
  const supabase = createClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .update({
      vendor_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order vendor notes:', error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard`);

  return data;
}
