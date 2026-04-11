const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking orders...');
  const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
  if (ordersError) console.error('Orders error:', ordersError);
  else console.log(`Found ${orders?.length || 0} orders.`);

  console.log('Checking bookings...');
  const { data: bookings, error: bookingsError } = await supabase.from('bookings').select('*');
  if (bookingsError) console.error('Bookings error:', bookingsError);
  else console.log(`Found ${bookings?.length || 0} bookings.`);

  console.log('Checking transactions...');
  const { data: transactions, error: txError } = await supabase.from('transactions').select('*');
  if (txError) console.error('Transactions error:', txError);
  else console.log(`Found ${transactions?.length || 0} transactions.`);
}

checkData();
