import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPromotionSchema() {
  console.log('Checking promotion_items table schema...');
  const { data, error } = await supabase
    .from('promotion_items')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching promotion_items:', error);
  } else {
    console.log('Sample promotion_item:', data[0]);
    if (data[0]) {
      console.log('Type of item_id:', typeof data[0].item_id);
    }
  }

  console.log('\nChecking promotions table schema...');
  const { data: promoData, error: promoError } = await supabase
    .from('promotions')
    .select('*')
    .limit(1);
    
  if (promoError) {
    console.error('Error fetching promotions:', promoError);
  } else {
    console.log('Sample promotion:', promoData[0]);
  }
}

checkPromotionSchema();
