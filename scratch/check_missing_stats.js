
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingStats() {
    console.log('--- Checking for reels missing stats ---');
    
    // Get all reels and all stats
    const { data: reels, error: reelError } = await supabase.from('reels').select('id');
    const { data: stats, error: statsError } = await supabase.from('reel_stats').select('reel_id');
    
    if (reelError || statsError) {
        console.error('Error fetching data:', reelError || statsError);
        return;
    }
    
    const reelIds = reels.map(r => r.id);
    const statIds = new Set(stats.map(s => s.reel_id));
    
    const missing = reelIds.filter(id => !statIds.has(id));
    
    console.log(`Total reels: ${reels.length}`);
    console.log(`Total stats records: ${stats.length}`);
    console.log(`Reels missing stats: ${missing.length}`);
    
    if (missing.length > 0) {
        console.log('Missing IDs:', missing);
    }
}

checkMissingStats();
