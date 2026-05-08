import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We use the relative path from the scratch folder to the lib folder
import { doGlobalSemanticSearch } from '../lib/actions/search';

async function testSearch() {
  const query = 'nhb nkl haja';
  console.log(`🔍 Testing search for: "${query}"`);
  
  try {
    const results = await doGlobalSemanticSearch(query);
    console.log(`✅ Found ${results.length} results`);
    results.slice(0, 5).forEach((r, i) => {
      console.log(`${i+1}. ${r.name || r.title} (${r.result_type}) - Distance: ${r.distance}`);
    });
  } catch (err) {
    console.error('❌ Search test failed:', err);
  }
}

testSearch();
