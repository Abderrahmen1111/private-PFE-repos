const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatus() {
  console.log('Testing "cancelled" (2 Ls)...');
  const { error: err1 } = await supabase.from('transactions')
    .update({ status: 'cancelled' })
    .eq('transaction_code', 'RES-623051-787');
  
  if (err1) {
    console.log('Error "cancelled":', err1.message);
    
    console.log('Testing "canceled" (1 L)...');
    const { error: err2 } = await supabase.from('transactions')
      .update({ status: 'canceled' })
      .eq('transaction_code', 'RES-623051-787');
    
    if (err2) {
      console.log('Error "canceled":', err2.message);
      
      console.log('Testing "failed"...');
      const { error: err3 } = await supabase.from('transactions')
        .update({ status: 'failed' })
        .eq('transaction_code', 'RES-623051-787');
      if (err3) console.log('Error "failed":', err3.message);
      else console.log('Success with "failed"!');
    } else {
      console.log('Success with "canceled"!');
    }
  } else {
    console.log('Success with "cancelled"!');
  }
}

testStatus();
