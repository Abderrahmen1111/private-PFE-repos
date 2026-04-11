
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReelActions() {
    const storeId = 9; // Existing store ID from find_store.js
    
    console.log('--- Testing publishReel (Direct DB Insert) ---');
    const { data: reel, error: pubError } = await supabase
        .from('reels')
        .insert({
            store_id: storeId,
            media_url: 'https://lxpwsazvkslrhfjfyzuh.supabase.co/storage/v1/object/public/stories/test.jpg',
            media_type: 'image',
            title: 'Test Reel ' + Date.now(),
            subtitle: 'This is a test reel created by verification script',
            price: 19.99,
            currency: 'TND',
            cta_type: 'view',
            status: 'active',
            category: 'Test'
        })
        .select()
        .single();
        
    if (pubError) {
        console.error('Error publishing reel:', pubError);
        return;
    }
    console.log('Published Reel ID:', reel.id);

    console.log('--- Testing Stats Initialization ---');
    const { data: stats, error: statsError } = await supabase
        .from('reel_stats')
        .insert({ reel_id: reel.id })
        .select()
        .single();
        
    if (statsError) {
        console.error('Error initializing stats:', statsError);
    } else {
        console.log('Stats initialized for reel:', stats.reel_id);
    }

    console.log('--- Testing getBusinessReels logic ---');
    const { data: reels, error: fetchError } = await supabase
        .from('reels')
        .select('*, reel_stats(*)')
        .eq('store_id', storeId);
        
    if (fetchError) {
        console.error('Error fetching reels:', fetchError);
    } else {
        console.log(`Fetched ${reels.length} reels for store ${storeId}`);
        const found = reels.find(r => r.id === reel.id);
        if (found) {
            console.log('Stored reel found in fetch results with stats:', found.reel_stats ? 'YES' : 'NO');
        }
    }

    console.log('--- Testing deleteReel logic ---');
    const { error: delError } = await supabase
        .from('reels')
        .delete()
        .eq('id', reel.id);
        
    if (delError) {
        console.error('Error deleting reel:', delError);
    } else {
        console.log('Reel deleted successfully');
    }
}

testReelActions();
