import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const [k, ...v] = l.split('=');
      return [k.trim(), v.join('=').trim()];
    })
);

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
  const { data, error } = await supabase
    .from('reels')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error fetching reels:', error);
  } else {
    console.log('✅ Reels sample row keys:', data.length > 0 ? Object.keys(data[0]) : 'No rows, let\'s insert a dummy row or check metadata');
    if (data.length === 0) {
      // Let's try to query PostgREST API metadata to get columns
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reels`, {
        method: 'OPTIONS',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const metadata = await res.json();
        console.log('✅ Columns in metadata:', metadata.definitions?.reels?.properties ? Object.keys(metadata.definitions.reels.properties) : 'No properties found');
      } else {
        console.log('❌ OPTIONS request failed:', res.status, await res.text());
      }
    }
  }
}

checkColumns();
