const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findEnumValues() {
  console.log('Querying pg_enum...');
  const { data, error } = await supabase.from('pg_enum').select('*'); // This usually fails due to RLS/PostgREST
  if (error) console.log('Cannot query pg_enum directly.');

  // Try to insert a value that DEFINITELY doesn't exist and see if the error message lists the valid ones
  console.log('Trying invalid insert to trigger helpful error...');
  const { error: err } = await supabase.from('transactions').insert({
    transaction_code: 'ERR-' + Date.now(),
    order_number: 'ERR',
    amount: 0,
    status: 'GIBBERISH_STATUS_CODE',
    type: 'payment'
  });
  
  if (err) {
    console.log('Error Message:', err.message);
    if (err.details) console.log('Error Details:', err.details);
  }
}

findEnumValues();
