
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'stories' });
  if (error) {
     // If RPC doesn't exist, try a simple query
     const { data: cols, error: colError } = await supabase
        .from('stories')
        .select('*')
        .limit(1);
     
     if (colError) {
         console.error('Error:', colError);
     } else {
         console.log('Columns:', Object.keys(cols[0] || {}));
     }
  } else {
    console.log('Table Info:', data);
  }
}

checkTable();
