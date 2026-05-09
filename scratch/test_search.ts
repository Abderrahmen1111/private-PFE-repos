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
    results.slice(0, 10).forEach((r: any, i: number) => {
      const displayName = r.name || r.title || 'Unknown';
      console.log(`${i+1}. ${displayName} (${r.result_type}) - Distance: ${r.distance?.toFixed(2) || 'N/A'}km`);
    });
  } catch (err) {
    console.error('❌ Search test failed:', err);
  }
}

testSearch();
