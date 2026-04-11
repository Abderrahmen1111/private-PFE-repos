const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  const { data: orders } = await supabase.from('orders').select('order_number, status');
  const { data: bookings } = await supabase.from('bookings').select('booking_number, status');
  
  console.log('Orders statuses:', orders);
  console.log('Bookings statuses:', bookings);
}

checkStatus();
