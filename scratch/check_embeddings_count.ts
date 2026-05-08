import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmbeddings() {
  const tables = ['items', 'stores', 'business_directory_tunisia', 'service_directory'];
  
  console.log('📊 Checking Embeddings Count:');
  console.log('============================');
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`❌ Error counting ${table}:`, error.message);
      continue;
    }
    
    const { count: withEmbedding, error: err2 } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
      
    if (err2) {
       // Maybe column doesn't exist?
       console.error(`❌ Error checking embedding column in ${table}:`, err2.message);
       continue;
    }

    console.log(`${table.padEnd(25)}: ${withEmbedding}/${count} items indexed (${((withEmbedding/count)*100).toFixed(1)}%)`);
  }
}

checkEmbeddings();
