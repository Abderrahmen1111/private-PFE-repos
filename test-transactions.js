const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTransactions() {
  console.log('Fetching transactions...');
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message, error.details, error.hint);
  } else {
    console.log('Data:', data);
  }
}

checkTransactions();
