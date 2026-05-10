import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkBuckets() {
  console.log('Checking Supabase Storage Buckets...');
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error listing buckets:', error.message);
  } else {
    console.log('Available buckets:', data.map(b => b.name));
  }
}

checkBuckets();
