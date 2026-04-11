
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeMore() {
    const types = ['saved', 'SAVED', 'bookmark', 'BOOKMARK', 'finish', 'FINISH', 'completed', 'COMPLETED', 'full_view', 'FULL_VIEW', 'engagement', 'ENGAGEMENT'];
    
    console.log('--- Probing more types ---');
    for (const t of types) {
        const { error } = await supabase.from('user_interactions').insert({
            user_id: 'c1111111-1111-1111-1111-111111111111',
            reel_id: 1,
            type: t
        });
        
        if (error && error.message.includes('check constraint')) {
            // failed
        } else if (error && error.message.includes('foreign key')) {
            console.log(`Type '${t}' PASSED check constraint.`);
        } else if (!error) {
            console.log(`Type '${t}' WORKED.`);
            await supabase.from('user_interactions').delete().eq('type', t);
        }
    }
}

probeMore();
