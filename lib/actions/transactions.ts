'use server'

import { createClient } from '@/lib/supabase/server'

export type Transaction = {
  id: string;
  type: 'order' | 'booking';
  reference: string;
  customer_name: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  details?: string;
  original_id?: number; // The numeric ID from orders or bookings table
};

const STATUS_MAP: Record<string, 'pending' | 'completed' | 'failed' | 'refunded'> = {
  'PENDING': 'pending',
  'VALIDATED': 'pending',
  'SHIPPED': 'pending',
  'CONFIRMED': 'pending',
  'COMPLETED': 'completed',
  'CANCELLED': 'failed',
};

export async function syncOrderTransaction(order: any, supabaseClient?: any) {
  const supabase = supabaseClient || createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('name, phone')
    .eq('id', order.store_id)
    .single();

  const transactionData = {
    transaction_code: order.order_number,
    order_number: order.order_number,
    customer_id: order.customer_id,
    customer_name: order.customer_name,
    merchant_id: order.store_id,
    merchant_name: store?.name || null,
    merchant_number: store?.phone || null,
    amount: order.total_price,
    status: STATUS_MAP[order.status] || 'pending',
    type: 'payment',
    date: order.created_at,
    time_created: order.created_at,
    qr_code_token: order.tracking_code || null
  };

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionData, { onConflict: 'transaction_code' });

  if (error) {
    console.error('Error syncing order to transaction:', error);
  }
}

export async function syncBookingTransaction(booking: any, supabaseClient?: any) {
  const supabase = supabaseClient || createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('name, phone')
    .eq('id', booking.store_id)
    .single();

  const transactionData = {
    transaction_code: booking.booking_number,
    order_number: booking.booking_number,
    booking_id: booking.id,
    customer_id: booking.customer_id,
    customer_name: booking.customer_name,
    merchant_id: booking.store_id,
    merchant_name: store?.name || null,
    merchant_number: store?.phone || null,
    amount: booking.price,
    status: STATUS_MAP[booking.status] || 'pending',
    type: 'payment',
    date: booking.created_at,
    time_created: booking.created_at
  };

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionData, { onConflict: 'transaction_code' });

  if (error) {
    console.error('Error syncing booking to transaction:', error);
  }
}

export async function getStoreTransactions(storeId: number): Promise<Transaction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('merchant_id', storeId)
    .order('time_created', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  const transactionsData = (data as any[]) || [];
  
  // To get original_id for orders, we need to match order_number with orders table IDs
  const orderNumbers = transactionsData.filter((t: any) => !t.booking_id).map((t: any) => t.order_number);
  
  let orderMap = new Map<string, number>();
  if (orderNumbers.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number')
      .in('order_number', orderNumbers);
    
    (orders || []).forEach((o: any) => orderMap.set(o.order_number, o.id));
  }

  return transactionsData.map((t: any) => {
    return {
      id: t.id,
      type: t.booking_id ? 'booking' : 'order',
      reference: t.order_number,
      customer_name: t.customer_name || 'Client',
      amount: t.amount,
      status: t.status as any,
      created_at: t.time_created || new Date().toISOString(),
      details: t.booking_id ? 'Réservation de service' : 'Vente de produit(s)',
      original_id: t.booking_id || orderMap.get(t.order_number) || undefined,
    };
  });
}

export async function getFinancialSummary(storeId: number) {
  const supabase = createClient();

  const [ordersResponse, bookingsResponse] = await Promise.all([
    supabase.from('orders').select('total_price').eq('store_id', storeId).eq('status', 'COMPLETED'),
    supabase.from('bookings').select('price').eq('store_id', storeId).eq('status', 'COMPLETED'),
  ]);

  const totalOrders = (ordersResponse.data as any[] || []).reduce((sum, o: any) => sum + (o.total_price || 0), 0);
  const totalBookings = (bookingsResponse.data as any[] || []).reduce((sum, b: any) => sum + (b.price || 0), 0);

  return {
    totalRevenue: totalOrders + totalBookings,
    ordersRevenue: totalOrders,
    bookingsRevenue: totalBookings,
    totalTransactions: (ordersResponse.data?.length || 0) + (bookingsResponse.data?.length || 0),
  };
}

export async function hasCompletedTransactionWithStore(storeId: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('customer_id', user.id)
    .eq('merchant_id', storeId)
    .eq('status', 'completed')
    .limit(1);

  if (error) {
    console.error('Error checking completed transactions:', error);
    return false;
  }

  return (data && data.length > 0) || false;
}
