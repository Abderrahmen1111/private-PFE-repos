import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/openrouter-embeddings';
import { translateDarijaForSearch, extractDarijaWords } from '../lib/darija-dictionary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugSearch() {
  const query = "صالون تجميل قريب مني";

  // 1. Translation
  const translated = translateDarijaForSearch(query);
  const darijaWords = extractDarijaWords(query);
  console.log("=== 1. TRANSLATION ===");
  console.log("Original:", query);
  console.log("Translated:", translated);
  console.log("Darija mots détectés:", darijaWords);

  // 2. Text search (what keywords are used)
  const keywords = translated.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  console.log("\n=== 2. KEYWORDS USED FOR TEXT SEARCH ===");
  console.log(keywords);

  // 3. Check how many stores have embeddings in DB
  const { data: embStats } = await supabase
    .from('stores')
    .select('id, name, embedding')
    .not('embedding', 'is', null)
    .limit(5);
  console.log("\n=== 3. STORES WITH EMBEDDINGS (sample) ===");
  console.log(embStats?.map(s => ({ id: s.id, name: s.name, hasEmbedding: !!s.embedding })));

  // 4. Check embedding coverage
  const { count: totalStores } = await supabase.from('stores').select('*', { count: 'exact', head: true });
  const { count: storesWithEmb } = await supabase.from('stores').select('*', { count: 'exact', head: true }).not('embedding', 'is', null);
  console.log("\n=== 4. EMBEDDING COVERAGE ===");
  console.log(`Total stores: ${totalStores}, With embeddings: ${storesWithEmb}`);

  // 5. Text search results
  const orFilter = keywords.map(k => `name.ilike.%${k}%`).join(',');
  if (orFilter) {
    const { data: textResults } = await supabase
      .from('stores')
      .select('id, name, category, city, rating_average')
      .or(orFilter)
      .limit(10);
    console.log("\n=== 5. TEXT SEARCH RESULTS ===");
    console.log(textResults);
  }

  // 6. Vector search
  console.log("\n=== 6. VECTOR SEARCH ===");
  const embedding = await generateEmbedding(translated);
  console.log(`Embedding generated: ${embedding.length} dims`);

  const { data: vectorResults, error: vecError } = await supabase.rpc(
    'search_global_semantic' as any,
    {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.18,
      match_count: 10,
    }
  );
  if (vecError) {
    console.error("Vector search error:", vecError);
  } else {
    console.log("Vector search results:");
    vectorResults?.slice(0, 10).forEach((r: any, i: number) => {
      console.log(`  ${i+1}. [${r.result_type}] ${r.name} — similarity: ${r.similarity?.toFixed(4)} — city: ${r.location_city}`);
    });
  }
}

debugSearch().catch(console.error);
