import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { generateEmbeddingsBatch } from '../lib/openrouter-embeddings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTable(tableName: string, idColumn: string, textColumns: string[]) {
  console.log(`\n🚀 Starting seeding for table: ${tableName}`);
  
  let processed = 0;
  let totalToProcess = 0;

  // Count missing
  const { count, error: countErr } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  if (countErr) {
    console.error(`Error counting ${tableName}:`, countErr.message);
    return;
  }

  totalToProcess = count || 0;
  console.log(`Total missing embeddings in ${tableName}: ${totalToProcess}`);

  if (totalToProcess === 0) return;

  const BATCH_SIZE = 10;
  const LIMIT = 500; // Process 500 at a time to avoid huge runs

  while (processed < Math.min(totalToProcess, LIMIT)) {
    const { data: items, error: fetchErr } = await supabase
      .from(tableName)
      .select(`${idColumn}, ${textColumns.join(', ')}`)
      .is('embedding', null)
      .limit(BATCH_SIZE);

    if (fetchErr || !items || items.length === 0) break;

    const texts = items.map((item: any) => {
      return textColumns.map(col => item[col] || '').join(' ').trim();
    }).filter(t => t.length > 0);

    if (texts.length === 0) {
        // Skip these items if they have no text to embed
        const ids = items.map((i: any) => i[idColumn]);
        await supabase.from(tableName).update({ embedding: [] } as any).in(idColumn, ids);
        processed += items.length;
        continue;
    }

    try {
      const embeddings = await generateEmbeddingsBatch(texts);
      
      for (let i = 0; i < items.length; i++) {
        if (embeddings[i]) {
          await supabase
            .from(tableName)
            .update({ embedding: embeddings[i] } as any)
            .eq(idColumn, (items[i] as any)[idColumn]);
        }
      }
      
      processed += items.length;
      console.log(`✅ ${tableName}: Processed ${processed}/${totalToProcess}`);
    } catch (e: any) {
      console.error(`❌ Batch failed in ${tableName}:`, e.message);
      break; // Stop on error to avoid burning tokens on failure loops
    }
  }
}

async function main() {
  console.log('🌟 Starting Mass Embedding Seeding 🌟');
  
  // Priority order
  await seedTable('items', 'id', ['name', 'description']);
  await seedTable('service_directory', 'service_id', ['name', 'description', 'category']);
  await seedTable('business_directory_tunisia', 'id', ['title', 'description', 'categoryName']);
  await seedTable('stores', 'id', ['name', 'description', 'category']);

  console.log('\n✨ Seeding process finished! ✨');
}

main();
