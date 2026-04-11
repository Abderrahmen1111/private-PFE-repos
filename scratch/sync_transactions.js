const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log('Fetching data...');
  
  const [ordersRes, bookingsRes, storesRes] = await Promise.all([
    supabase.from('orders').select('*'),
    supabase.from('bookings').select('*'),
    supabase.from('stores').select('*')
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (storesRes.error) throw storesRes.error;

  const orders = ordersRes.data;
  const bookings = bookingsRes.data;
  const stores = storesRes.data;

  const storeMap = new Map(stores.map(s => [s.id, s]));

  const statusMap = {
    'PENDING': 'pending',
    'VALIDATED': 'pending',
    'SHIPPED': 'pending',
    'CONFIRMED': 'pending',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  };

  const transactions = [];

  // Map Orders
  orders.forEach(o => {
    const store = storeMap.get(o.store_id);
    transactions.push({
      transaction_code: o.order_number,
      order_number: o.order_number,
      customer_id: o.customer_id,
      customer_name: o.customer_name,
      merchant_id: o.store_id,
      merchant_name: store?.name || null,
      merchant_number: store?.phone || null,
      amount: o.total_price,
      status: statusMap[o.status] || 'pending',
      type: 'payment',
      date: o.created_at,
      time_created: o.created_at,
      qr_code_token: o.tracking_code || null
    });
  });

  // Map Bookings
  bookings.forEach(b => {
    const store = storeMap.get(b.store_id);
    transactions.push({
      transaction_code: b.booking_number,
      order_number: b.booking_number,
      booking_id: b.id,
      customer_id: b.customer_id,
      customer_name: b.customer_name,
      merchant_id: b.store_id,
      merchant_name: store?.name || null,
      merchant_number: store?.phone || null,
      amount: b.price,
      status: statusMap[b.status] || 'pending',
      type: 'payment',
      date: b.created_at,
      time_created: b.created_at
    });
  });

  if (transactions.length === 0) {
    console.log('No transactions to sync.');
    return;
  }

  console.log(`Syncing ${transactions.length} transactions...`);

  // Insert transactions
  const { error: insertError } = await supabase.from('transactions').insert(transactions);

  if (insertError) {
    console.error('Error inserting transactions:', insertError);
  } else {
    console.log('Successfully synced all transactions.');
  }
}

sync().catch(console.error);
