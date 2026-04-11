const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnum() {
  const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'transaction_status' });
  if (error) {
    // If RPC doesn't exist, try a direct query to pg_enum
    const { data: pgData, error: pgError } = await supabase.from('_pg_enum').select('*').limit(1); // Won't work via PostgREST usually
    console.log('Error fetching enum:', error.message);
    
    // Fallback: try to insert with uppercase to see if it works
    console.log('Trying uppercase insert...');
    const testTx = {
      transaction_code: 'TEST-' + Date.now(),
      order_number: 'TEST',
      amount: 0,
      status: 'PENDING', // Try uppercase
      type: 'payment'
    };
    const { error: testError } = await supabase.from('transactions').insert(testTx);
    console.log('Uppercase insert result:', testError ? testError.message : 'Success');
  } else {
    console.log('Enum values:', data);
  }
}

checkEnum();
