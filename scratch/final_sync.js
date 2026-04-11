const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSync() {
  console.log('Truncating transactions table...');
  const { error: delError } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.error('Delete error:', delError);

  console.log('Fetching data...');
  const [ordersRes, bookingsRes, storesRes] = await Promise.all([
    supabase.from('orders').select('*, stores(name, phone)'),
    supabase.from('bookings').select('*, stores(name, phone)'),
    supabase.from('stores').select('*')
  ]);

  const statusMap = {
    'PENDING': 'pending',
    'VALIDATED': 'pending',
    'SHIPPED': 'pending',
    'CONFIRMED': 'pending',
    'COMPLETED': 'completed',
    'CANCELLED': 'failed' // Use 'failed' instead of 'cancelled'
  };

  const transactions = [];

  ordersRes.data.forEach(o => {
    transactions.push({
      transaction_code: o.order_number,
      order_number: o.order_number,
      customer_id: o.customer_id,
      customer_name: o.customer_name,
      merchant_id: o.store_id,
      merchant_name: o.stores?.name || null,
      merchant_number: o.stores?.phone || null,
      amount: o.total_price,
      status: statusMap[o.status] || 'pending',
      type: 'payment',
      date: o.created_at,
      time_created: o.created_at,
      qr_code_token: o.tracking_code || null
    });
  });

  bookingsRes.data.forEach(b => {
    transactions.push({
      transaction_code: b.booking_number,
      order_number: b.booking_number,
      booking_id: b.id,
      customer_id: b.customer_id,
      customer_name: b.customer_name,
      merchant_id: b.store_id,
      merchant_name: b.stores?.name || null,
      merchant_number: b.stores?.phone || null,
      amount: b.price,
      status: statusMap[b.status] || 'pending',
      type: 'payment',
      date: b.created_at,
      time_created: b.created_at
    });
  });

  console.log(`Inserting ${transactions.length} transactions...`);
  const { error } = await supabase.from('transactions').insert(transactions);
  if (error) console.error('Insert error:', error);
  else console.log('Final Sync Successful!');
}

finalSync();
