
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInteractions() {
    const storeId = 9;
    const userId = 'c1111111-1111-1111-1111-111111111111'; // Mohamed Ali (Client from seed)

    console.log('--- 1. Manual Insert (Reel only) ---');
    const { data: reel, error: pubError } = await supabase
        .from('reels')
        .insert({
            store_id: storeId,
            media_url: 'https://test.com/interaction.jpg',
            media_type: 'image',
            title: 'Interaction Test ' + Date.now(),
            status: 'active'
        })
        .select()
        .single();
        
    if (pubError) {
        console.error('Error publishing reel:', pubError);
        return;
    }
    console.log('Published Reel ID:', reel.id);

    console.log('--- 2. Simulating Interactions ---');
    const interactions = [
        { user_id: userId, reel_id: reel.id, type: 'like' },
        { user_id: userId, reel_id: reel.id, type: 'save' },
        { user_id: userId, reel_id: reel.id, type: 'completion' }
    ];

    const { error: interError } = await supabase
        .from('user_interactions')
        .insert(interactions);

    if (interError) {
        console.error('Error adding interactions:', interError);
    } else {
        console.log('Interactions added successfully.');
    }

    console.log('--- 3. Verifying aggregation in getBusinessReels logic ---');
    // Fetch reels
    const { data: reelsData } = await supabase.from('reels').select('*, reel_stats(*)').eq('store_id', storeId);
    const { data: interactionsData } = await supabase.from('user_interactions').select('reel_id, type').in('reel_id', [reel.id]);

    const targetReel = reelsData.find(r => r.id === reel.id);
    const reelInteractions = interactionsData.filter(i => i.reel_id === reel.id);

    const stats = {
        likes: reelInteractions.filter(i => i.type === 'like').length,
        saves: reelInteractions.filter(i => i.type === 'save').length,
        completions: reelInteractions.filter(i => i.type === 'completion').length
    };

    console.log('Aggregated Stats:', stats);

    if (stats.likes === 1 && stats.saves === 1 && stats.completions === 1) {
        console.log('✅ Aggregation logic works!');
    } else {
        console.error('❌ Aggregation logic failed');
    }

    // Cleanup
    await supabase.from('reels').delete().eq('id', reel.id);
    console.log('Cleanup done.');
}

testInteractions();
