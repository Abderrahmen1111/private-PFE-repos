
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data: store, error: storeError } = await supabase.from('stores').select('*').limit(1).single();
    const { data: user, error: userError } = await supabase.from('users').select('*').limit(1).single();
    
    console.log('--- Store Columns ---');
    if (store) console.log(Object.keys(store));
    
    console.log('--- User Columns ---');
    if (user) console.log(Object.keys(user));
}

checkColumns();
