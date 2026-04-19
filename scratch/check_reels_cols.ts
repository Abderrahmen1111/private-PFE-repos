import { createClient } from './lib/supabase/server';

async function checkCols() {
  const supabase = createClient();
  const { data, error } = await supabase.from('reels').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data in reels table');
    // Try to get columns from information_schema if possible, but usually select * is enough if there is data.
    // Alternatively, try to insert a dummy row to see if it fails.
  }
}
