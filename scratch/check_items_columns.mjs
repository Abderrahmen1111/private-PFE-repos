
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'items' });
  if (error) {
    console.error('Error fetching columns:', error);
    // If RPC fails, try a simple select with limit 0
    const { data: item, error: selectError } = await supabase.from('items').select('*').limit(1).single();
    if (selectError) {
      console.error('Select error:', selectError);
    } else {
      console.log('Columns found via select:', Object.keys(item));
    }
  } else {
    console.log('Columns found via RPC:', data);
  }
}

checkColumns();
