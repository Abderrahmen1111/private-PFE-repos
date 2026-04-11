
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLazyInitialization() {
    const storeId = 9;
    
    console.log('--- 1. Manual Insert (Reel only) ---');
    const { data: reel, error: pubError } = await supabase
        .from('reels')
        .insert({
            store_id: storeId,
            media_url: 'https://test.com/lazy.jpg',
            media_type: 'image',
            title: 'Lazy Test ' + Date.now(),
            status: 'active'
        })
        .select()
        .single();
        
    if (pubError) {
        console.error('Error publishing reel:', pubError);
        return;
    }
    console.log('Published Reel ID:', reel.id);

    console.log('--- 2. Checking if stats exist immediately (Should be NO) ---');
    const { data: statsBefore } = await supabase
        .from('reel_stats')
        .select('*')
        .eq('reel_id', reel.id)
        .single();
    
    console.log('Stats exist before lazy fetch:', statsBefore ? 'YES' : 'NO');

    console.log('--- 3. Simulating Lazy Initialization logic ---');
    // Simulate what's in reels.ts
    const { data: fetchedReels } = await supabase
        .from('reels')
        .select('*, reel_stats(*)')
        .eq('id', reel.id);

    const missingStats = fetchedReels.filter(r => !r.reel_stats);
    if (missingStats.length > 0) {
        console.log(`Found ${missingStats.length} reels missing stats. Initializing...`);
        await Promise.all(missingStats.map(r => 
            supabase.from('reel_stats').insert({ reel_id: r.id })
        ));
    }

    console.log('--- 4. Checking if stats exist now (Should be YES) ---');
    const { data: statsAfter } = await supabase
        .from('reel_stats')
        .select('*')
        .eq('reel_id', reel.id)
        .single();
    
    console.log('Stats exist after lazy fetch:', statsAfter ? 'YES' : 'NO');

    // Cleanup
    await supabase.from('reels').delete().eq('id', reel.id);
    console.log('Cleanup done.');
}

testLazyInitialization();
