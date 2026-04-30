import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, owner_id');

  if (storesError) {
    console.error('Error fetching stores:', storesError);
    return;
  }

  console.log('Stores:', stores);

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, name, store_id')
    .limit(5);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    return;
  }

  console.log('Sample Items:', items);
}

checkItems();
