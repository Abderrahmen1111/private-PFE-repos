import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log('Checking items table schema...');
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching items:', error);
  } else {
    console.log('Columns in items table:', Object.keys(data[0] || {}));
  }
}

checkSchema();
