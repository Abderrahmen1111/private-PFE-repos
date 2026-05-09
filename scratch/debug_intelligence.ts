import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debug() {
  // Find Aymen Plombier
  console.log('\n=== Finding Aymen Plombier ===');
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, owner_id')
    .ilike('name', '%plomb%');
  console.log('Stores matching "plomb":', stores);

  if (!stores?.length) {
    // Try broader search
    const { data: all } = await supabase
      .from('stores')
      .select('id, name')
      .ilike('name', '%aymen%');
    console.log('Stores matching "aymen":', all);
  }

  const storeId = stores?.[0]?.id;
  if (!storeId) { console.log('Store not found!'); return; }

  console.log(`\nUsing storeId: ${storeId}`);

  // Check reels
  const { data: reels } = await supabase
    .from('reels')
    .select('id, store_id, title')
    .eq('store_id', storeId);
  console.log(`\nReels for store ${storeId}:`, reels);

  // Check reel_comments for those reels
  const reelIds = (reels || []).map(r => r.id);
  if (reelIds.length > 0) {
    const { data: comments } = await supabase
      .from('reel_comments' as any)
      .select('id, content, reel_id')
      .in('reel_id', reelIds);
    console.log('\nComments:', comments);
  }

  // Also check: which store has reel_id=8 (from the Supabase screenshot)
  console.log('\n=== Which store owns reel 8? ===');
  const { data: reel8 } = await supabase
    .from('reels')
    .select('id, store_id, title')
    .eq('id', 8)
    .single();
  console.log('Reel 8:', reel8);
}

debug().catch(console.error);
