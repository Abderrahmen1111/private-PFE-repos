
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalProbe() {
    const types = ['like', 'view', 'share', 'comment', 'report', 'save', 'saved', 'bookmark', 'favorite', 'heart', 'finish', 'complete', 'completed', 'completion'];
    
    console.log('--- Probing all types ---');
    for (const t of types) {
        const { error } = await supabase.from('user_interactions').insert({
            user_id: 'c1111111-1111-1111-1111-111111111111',
            reel_id: 1, // We don't care if it fails FK, we just want to see if it passes check constraint
            type: t
        });
        
        if (error && error.message.includes('check constraint')) {
            // failed constraint
        } else {
            // Either it worked or it failed on something ELSE (like FK), meaning the type is valid in the constraint
            console.log(`Type '${t}' is VALID (passes constraint check).`);
        }
    }
}

finalProbe();
