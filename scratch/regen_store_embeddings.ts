import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/openrouter-embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function regenerateStoreEmbeddings() {
  console.log("📥 Fetching all stores...");
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, description, category, city, address');

  if (error || !stores) {
    console.error("Failed to fetch stores:", error);
    return;
  }

  console.log(`Found ${stores.length} stores. Re-generating embeddings...\n`);

  for (const store of stores) {
    // Build a rich text that includes all semantic context
    const text = [
      store.name,
      store.category,
      store.city,
      store.description,
      store.address,
    ].filter(Boolean).join(' — ');

    try {
      console.log(`[${store.id}] "${store.name}" → generating embedding for: "${text.slice(0, 80)}..."`);
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .from('stores')
        .update({ embedding: JSON.stringify(embedding) } as any)
        .eq('id', store.id);

      if (updateError) {
        console.error(`  ❌ Failed to update store ${store.id}:`, updateError.message);
      } else {
        console.log(`  ✅ Updated (${embedding.length} dims)`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`  ❌ Error for store ${store.id}:`, err.message);
    }
  }

  console.log("\n✅ Done! All store embeddings re-generated.");
}

regenerateStoreEmbeddings().catch(console.error);
