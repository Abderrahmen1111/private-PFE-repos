import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { doGlobalSemanticSearch } from '../lib/actions/search';

async function testCarSearch() {
  const query = 'krhbty fsdet';
  console.log(`🔍 Testing search for: "${query}"`);
  
  try {
    const results = await doGlobalSemanticSearch(query);
    console.log(`✅ Results count: ${results.length}`);
    results.slice(0, 3).forEach((r, i) => {
      console.log(`${i+1}. ${r.name || r.title} (${r.result_type})`);
    });
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testCarSearch();
