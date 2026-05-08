
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
  console.log('Checking items table in Supabase...');
  
  const { count, error: countError } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error fetching count:', countError);
  } else {
    console.log(`Total items in database: ${count}`);
  }

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, name, store_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  } else {
    console.log('Last 10 items:');
    console.table(items);
  }

  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, owner_id')
    .limit(5);

  if (storesError) {
    console.error('Error fetching stores:', storesError);
  } else {
    console.log('Sample stores:');
    console.table(stores);
  }
}

checkItems();
