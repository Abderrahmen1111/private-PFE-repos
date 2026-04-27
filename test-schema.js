const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log('Fetching columns...');
  // Since we might not have direct SQL access through JS client without an RPC,
  // let's try to upsert a fake transaction and see the error.
  const { data, error } = await supabase.from('transactions').upsert({
    transaction_code: 'TEST-123'
  });
  
  if (error) {
    console.log('Upsert Error:', error);
  } else {
    console.log('Upsert Success:', data);
  }
}

checkSchema();
