import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('inspect_table', { table_name: 'orders' });
  if (error) {
    // If RPC doesn't exist, try a simple query
    const { data: cols, error: colError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (cols && cols.length > 0) {
        console.log('Columns in orders:', Object.keys(cols[0]));
    } else if (colError) {
        console.log('Error fetching columns:', colError);
    } else {
        console.log('No rows in orders, cannot determine columns via select *');
    }
  } else {
    console.log('Table info:', data);
  }
}

checkSchema();
