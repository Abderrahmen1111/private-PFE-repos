import { createClient } from '../lib/supabase/server'

async function checkReels() {
  const supabase = createClient()
  const { data, error } = await (supabase as any)
    .from('reels')
    .select('*')
    .eq('store_id', 16)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Latest Reel for Store 16:');
  console.log(JSON.stringify(data, null, 2));
}

checkReels();
