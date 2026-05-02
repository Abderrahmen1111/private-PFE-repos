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
  original_id?: number;
  qr_code_token?: string | null;
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

  // Fetch store data with more fields
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, phone, owner_id')
    .eq('id', order.store_id)
    .single();

  if (!store) {
    console.error(`[SyncOrder] Store ${order.store_id} not found for order ${order.order_number}`);
  }

  const transactionData = {
    transaction_code: order.order_number,
    order_number: order.order_number,
    customer_id: order.customer_id,
    customer_name: order.customer_name || 'Client',
    merchant_id: order.store_id,
    merchant_name: store?.name || 'Boutique',
    merchant_number: store?.phone || null,
    amount: order.total_price || 0,
    status: (STATUS_MAP[order.status] || 'pending') as any,
    date: order.created_at || new Date().toISOString(),
    time_created: order.created_at || new Date().toISOString(),
    qr_code_token: order.tracking_code || order.order_number
  };

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionData, { onConflict: 'transaction_code' });

  if (error) {
    console.error('[SyncOrder] Upsert Error:', error);
  }
}

export async function syncBookingTransaction(booking: any, supabaseClient?: any) {
  const supabase = supabaseClient || createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, phone, owner_id')
    .eq('id', booking.store_id)
    .single();

  if (!store) {
    console.error(`[SyncBooking] Store ${booking.store_id} not found for booking ${booking.booking_number}`);
  }

  const transactionData = {
    transaction_code: booking.booking_number,
    order_number: booking.booking_number,
    booking_id: booking.id,
    customer_id: booking.customer_id,
    customer_name: booking.customer_name || 'Client',
    merchant_id: booking.store_id,
    merchant_name: store?.name || 'Boutique',
    merchant_number: store?.phone || null,
    amount: booking.price || 0,
    status: (STATUS_MAP[booking.status] || 'pending') as any,
    date: booking.created_at || new Date().toISOString(),
    time_created: booking.created_at || new Date().toISOString(),
    qr_code_token: booking.booking_number
  };

  const { error } = await supabase
    .from('transactions')
    .upsert(transactionData, { onConflict: 'transaction_code' });

  if (error) {
    console.error('[SyncBooking] Upsert Error:', error);
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

  // To get original_id and details, we need to match with orders/bookings table
  const orderNumbers = transactionsData.filter((t: any) => !t.booking_id).map((t: any) => t.order_number);
  const bookingIds = transactionsData.filter((t: any) => t.booking_id).map((t: any) => t.booking_id);

  let orderMap = new Map<string, { id: number, name: string }>();
  let bookingMap = new Map<number, { name: string }>();

  if (orderNumbers.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, items(name)')
      .in('order_number', orderNumbers);

    (orders || []).forEach((o: any) => {
      orderMap.set(o.order_number, { id: o.id, name: o.items?.name || 'Produit' });
    });
  }

  if (bookingIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, items(name)')
      .in('id', bookingIds);

    (bookings || []).forEach((b: any) => {
      bookingMap.set(b.id, { name: b.items?.name || 'Service' });
    });
  }

  return transactionsData.map((t: any) => {
    const orderInfo = !t.booking_id ? orderMap.get(t.order_number) : null;
    const bookingInfo = t.booking_id ? bookingMap.get(t.booking_id) : null;

    return {
      id: t.id,
      type: t.booking_id ? 'booking' : 'order',
      reference: t.order_number,
      customer_name: t.customer_name || 'Client',
      amount: t.amount,
      status: t.status as any,
      created_at: t.time_created || new Date().toISOString(),
      details: bookingInfo?.name || orderInfo?.name || (t.booking_id ? 'Réservation service' : 'Vente produit'),
      original_id: t.booking_id || orderInfo?.id || undefined,
      qr_code_token: t.qr_code_token || null,
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
