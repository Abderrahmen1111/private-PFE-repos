
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function duplicate from reels.ts for testing
function parseMediaUrls(url) {
    if (!url) return [];
    if (url.startsWith('[') && url.endsWith(']')) {
        try {
            return JSON.parse(url);
        } catch (e) {
            return [url];
        }
    }
    return [url];
}

async function testMultiImageUrl() {
    console.log('--- Testing JSON Array Storage ---');
    const urls = ['https://test.com/1.jpg', 'https://test.com/2.jpg'];
    const jsonStr = JSON.stringify(urls);
    
    console.log('JSON Stringified:', jsonStr);
    const parsed = parseMediaUrls(jsonStr);
    console.log('Parsed Array:', parsed);
    
    if (parsed.length === 2 && parsed[1] === urls[1]) {
        console.log('✅ Parsing logic works!');
    } else {
        console.error('❌ Parsing logic failed');
        process.exit(1);
    }

    console.log('--- Testing compatibility with single URL ---');
    const singleUrl = 'https://test.com/single.jpg';
    const parsedSingle = parseMediaUrls(singleUrl);
    console.log('Parsed Single:', parsedSingle);
    
    if (parsedSingle.length === 1 && parsedSingle[0] === singleUrl) {
        console.log('✅ Backward compatibility works!');
    } else {
        console.error('❌ Backward compatibility failed');
        process.exit(1);
    }
}

testMultiImageUrl();
