const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncPending() {
  const { data: orders } = await supabase.from('orders').select('*, stores(name, phone)');
  const { data: bookings } = await supabase.from('bookings').select('*, stores(name, phone)');

  const transactions = [];

  orders.forEach(o => {
    transactions.push({
      transaction_code: o.order_number,
      order_number: o.order_number,
      customer_id: o.customer_id,
      customer_name: o.customer_name,
      merchant_id: o.store_id,
      merchant_name: o.stores?.name || null,
      merchant_number: o.stores?.phone || null,
      amount: o.total_price,
      status: 'pending', // Force pending
      type: 'payment',
      date: o.created_at,
      time_created: o.created_at
    });
  });

  bookings.forEach(b => {
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
      status: 'pending', // Force pending
      type: 'payment',
      date: b.created_at,
      time_created: b.created_at
    });
  });

  console.log(`Syncing ${transactions.length} transactions as pending...`);
  const { error } = await supabase.from('transactions').insert(transactions);
  if (error) console.error('Error:', error);
  else console.log('Success!');
}

syncPending();
