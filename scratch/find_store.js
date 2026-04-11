
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findStore() {
    const { data: stores, error } = await supabase.from('stores').select('id, name');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Stores:', stores);
    }
}

findStore();
