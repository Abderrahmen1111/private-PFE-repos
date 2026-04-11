
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  const { data, error } = await supabase.rpc('get_triggers'); // This might not exist
  if (error) {
     // Try to check if we can insert into reels and if statistics appear
     console.log('Checking reels table...');
     const { data: reels, error: reelError } = await supabase.from('reels').select('id').limit(1);
     if (reelError) {
         console.error('Reels Error:', reelError);
     } else {
         console.log('Reels table exists.');
     }

     console.log('Checking reel_stats table...');
     const { data: stats, error: statsError } = await supabase.from('reel_stats').select('*').limit(1);
     if (statsError) {
         console.error('Stats Error:', statsError);
     } else {
         console.log('Stats table exists.');
     }
  } else {
    console.log('Triggers:', data);
  }
}

checkTriggers();
