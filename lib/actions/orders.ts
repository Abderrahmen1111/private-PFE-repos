'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';
import { syncOrderTransaction } from './transactions';
import { createNotification } from './notifications';
import { decrementStock } from './items';
import { analyzeFraud, saveFraudAnalysis } from './fraud-detection';
import { Client as QStashClient } from '@upstash/qstash';

const qstash = process.env.QSTASH_TOKEN ? new QStashClient({ token: process.env.QSTASH_TOKEN }) : null;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const publishQStashEvent = async (endpoint: string, payload: any, delay: number = 0) => {
  if (!qstash) return;
  try {
    await qstash.publishJSON({
      url: `${siteUrl}/api/workers/${endpoint}`,
      body: payload,
      delay
    });
  } catch (err) {
    console.error(`[QStash] Failed to publish ${endpoint}:`, err);
  }
};

export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];

/**
 * Create a new order
 * Called when user clicks "Order" on a product page
 */
export async function createOrder(data: Omit<OrderInsert, 'order_number' | 'status' | 'customer_id'>) {
  const supabase = createClient() as any;
  
  // 1. Get current session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Vous devez être connecté pour commander.');
  }

  // 2. Check if the user is the owner of the store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('owner_id')
    .eq('id', data.store_id)
    .single();

  if (storeError || !store) {
    throw new Error('Store non trouvé.');
  }

  if (store.owner_id === user.id) {
    throw new Error('Vous ne pouvez pas commander dans votre propre boutique.');
  }

  // 3. Check for existing PENDING order for this specific item (Prevent duplicates)
  const { data: existingPending, error: checkError } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('customer_id', user.id)
    .eq('item_id', data.item_id)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (existingPending) {
    throw new Error(`Une commande est déjà en attente pour cet article (${existingPending.order_number}). Veuillez attendre la validation du commerçant.`);
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

  if (order) {
    // Sync to transactions immediately (even if PENDING)
    await syncOrderTransaction(order, supabase);
    
    // Automatically schedule a background job to check against payment failure (2 mins default delay)
    await publishQStashEvent('payment-retry', { orderId: order.id }, 120);

    // Notify Store Owner
    await createNotification({
      userId: store.owner_id,
      title: 'Nouvelle commande !',
      description: `Vous avez reçu une nouvelle commande ${orderNumber} pour ${data.quantity}x ${data.unit_price} DT.`,
      type: 'ORDER',
      link: `/dashboard/${data.store_id}/leads`,
      metadata: { orderId: order.id, storeId: data.store_id }
    });

    // ─── FRAUD ANALYSIS ───────────────────────────────────────────────────────
    try {
      const fraudAnalysis = await analyzeFraud({
        customer_id: user.id,
        store_id: data.store_id as number,
        item_id: data.item_id as number,
        quantity: data.quantity as number,
        total: data.total_price as number,
        delivery_address: data.delivery_address,
        entity_type: 'ORDER'
      });
      await saveFraudAnalysis(order.id, fraudAnalysis, 'ORDER');
    } catch (fraudErr) {
      console.error('[createOrder] Fraud Analysis failed:', fraudErr);
      // We don't block the order if fraud analysis fails, but we log it
    }
    // ──────────────────────────────────────────────────────────────────────────
  }

  revalidatePath(`/merchants/business/${data.store_id}`);
  revalidatePath(`/profile/user`);
  revalidatePath(`/profile/cart`);
  
  return { success: true, order };
}

/**
 * Get all orders for a specific customer (user)
 * Displayed in user profile under "Commands" section
 */
export async function getUserOrders(customerId: string) {
  const supabase = createClient() as any;

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
    query = query.eq('status', status as any);
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

  if (data) {
    await syncOrderTransaction(data, supabase);
    // Dispatch an asynchronous job to sync with external systems (e.g. ERP) after validation
    await publishQStashEvent('sync-orders', { orderId: data.id });

    // Decrement Stock
    if (data.item_id && data.quantity) {
      await decrementStock(data.item_id, data.quantity);
    }

    // Notify Customer
    if (data.customer_id) {
       await createNotification({
         userId: data.customer_id,
         title: 'Commande validée !',
         description: `Votre commande ${data.order_number} a été validée par le vendeur.`,
         type: 'ORDER',
         link: `/profile/user?view=commands`,
         metadata: { orderId: data.id }
       });
    }
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
  status: 'PENDING' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
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

  if (data) {
    await syncOrderTransaction(data, supabase);

    // Notify Customer
    if (data.customer_id) {
       const statusMap: Record<string, string> = {
         'IN_PROGRESS': 'est en cours de livraison',
         'COMPLETED': 'est maintenant terminée',
         'CANCELLED': 'a été annulée'
       };
       const statusText = statusMap[status] || `est passée en statut ${status}`;

       await createNotification({
         userId: data.customer_id,
         title: `Commande ${status}`,
         description: `Votre commande ${data.order_number} ${statusText}.`,
         type: 'ORDER',
         link: `/profile/user?view=commands`,
         metadata: { orderId: data.id, status }
       });
    }
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
import { createAdminClient } from '../supabase/admin';

export async function cancelOrder(orderId: number, reason?: string) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Vous devez être connecté pour annuler une commande.');
  }

  console.log('[cancelOrder] Received orderId:', orderId, 'User:', user.id);

  if (!orderId || isNaN(orderId)) {
    throw new Error(`ID de commande invalide: ${orderId}`);
  }

  // 2. Fetch order to verify ownership
  const { data: order, error: fetchError } = await adminSupabase
    .from('orders')
    .select('customer_id, status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('[cancelOrder] Order not found or fetch error:', fetchError);
    throw new Error(`Commande non trouvée.`);
  }

  if (order.customer_id !== user.id) {
    console.error('[cancelOrder] Unauthorized attempt by user:', user.id, 'for order owner:', order.customer_id);
    throw new Error('Vous n\'êtes pas autorisé à annuler cette commande.');
  }

  if (order.status !== 'PENDING') {
    throw new Error('Seules les commandes en attente peuvent être annulées.');
  }

  // 3. Perform cancellation using admin client to bypass RLS restrictions
  const { data: results, error } = await adminSupabase
    .from('orders')
    .update({
      status: 'CANCELLED',
      vendor_notes: reason || 'Commande annulée par le client',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select();

  if (error) {
    console.error('[cancelOrder] Admin update error:', error);
    throw new Error(`Erreur lors de l'annulation : ${error.message}`);
  }

  if (!results || results.length === 0) {
    throw new Error(`Échec de l'annulation de la commande.`);
  }

  const data = results[0];

  if (data) {
    await syncOrderTransaction(data, adminSupabase as any);
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/profile/user`);
  revalidatePath(`/profile/cart`);

  return data;
}

/**
 * Initiates an asynchronous refund process via Upstash QStash.
 * This offloads the heavy external API communication from the main server thread.
 */
export async function initiateAsyncRefund(orderId: number, reason?: string) {
  await publishQStashEvent('process-refund', { orderId, reason });
  return { success: true, message: 'Refund processing started asynchronously' };
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

  if (data) {
    await syncOrderTransaction(data, supabase);
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

  if (data) {
    await syncOrderTransaction(data, supabase);
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
