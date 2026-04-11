
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function probePrefixes() {
    const types = ['likes', 'views', 'saves', 'completions', 'like_reel', 'save_reel', 'complete_reel', 'view_reel'];
    
    console.log('--- Probing prefixes/plurals ---');
    for (const t of types) {
        const { error } = await supabase.from('user_interactions').insert({
            user_id: 'c1111111-1111-1111-1111-111111111111',
            reel_id: 1,
            type: t
        });
        
        if (error && error.message.includes('check constraint')) {
            // failed
        } else {
            console.log(`Type '${t}' is VALID.`);
        }
    }
}

probePrefixes();
