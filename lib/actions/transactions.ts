'use server'

import { createClient } from '@/lib/supabase/server'

export type Transaction = {
  id: string;
  type: 'order' | 'booking';
  reference: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  details?: string;
};

export async function getStoreTransactions(storeId: number): Promise<Transaction[]> {
  const supabase = createClient();

  // 1. Fetch Orders (Products)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total_price, status, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  // 2. Fetch Bookings (Services)
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, booking_number, customer_name, price, status, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
  }

  // 3. Format and Merge
  const formattedOrders = (orders || []).map(o => ({
    id: `ORD-${o.id}`,
    type: 'order' as const,
    reference: o.order_number,
    customer_name: o.customer_name,
    amount: o.total_price,
    status: o.status.toLowerCase(),
    created_at: o.created_at || new Date().toISOString(),
    details: 'Vente de produit(s)',
  }));

  const formattedBookings = (bookings || []).map(b => ({
    id: `BOK-${b.id}`,
    type: 'booking' as const,
    reference: b.booking_number,
    customer_name: b.customer_name,
    amount: b.price,
    status: b.status.toLowerCase(),
    created_at: b.created_at || new Date().toISOString(),
    details: 'Réservation de service',
  }));

  // 4. Sort by Date
  return [...formattedOrders, ...formattedBookings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getFinancialSummary(storeId: number) {
  const supabase = createClient();

  const [ordersResponse, bookingsResponse] = await Promise.all([
    supabase.from('orders').select('total_price').eq('store_id', storeId).eq('status', 'COMPLETED'),
    supabase.from('bookings').select('price').eq('store_id', storeId).eq('status', 'COMPLETED'),
  ]);

  const totalOrders = (ordersResponse.data || []).reduce((sum, o) => sum + o.total_price, 0);
  const totalBookings = (bookingsResponse.data || []).reduce((sum, b) => sum + b.price, 0);

  return {
    totalRevenue: totalOrders + totalBookings,
    ordersRevenue: totalOrders,
    bookingsRevenue: totalBookings,
    totalTransactions: (ordersResponse.data?.length || 0) + (bookingsResponse.data?.length || 0),
  };
}
