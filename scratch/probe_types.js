
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
    console.log('--- Checking user_interactions table structure ---');
    
    // We can't easily see constraints via simple select, but we can try to insert a few known types and see which ones work.
    // Or better, query the information_schema if we have permissions.
    
    const sql = `
        SELECT
            conname AS constraint_name,
            pg_get_constraintdef(c.oid) AS constraint_definition
        FROM
            pg_constraint c
        JOIN
            pg_namespace n ON n.oid = c.connamespace
        WHERE
            contype = 'c' 
            AND n.nspname = 'public' 
            AND conrelid = 'public.user_interactions'::regclass;
    `;
    
    // Use rpc if available, or just try to guess.
    // Since I don't have a direct SQL runner, I'll try to insert 'LIKE', 'STORY_VIEW', etc.
    
    const typesToTry = ['like', 'LIKE', 'save', 'SAVE', 'favorite', 'FAVORITE', 'complete', 'COMPLETE', 'view', 'VIEW'];
    
    for (const t of typesToTry) {
        const { error } = await supabase.from('user_interactions').insert({
            user_id: 'c1111111-1111-1111-1111-111111111111',
            reel_id: 1, // Assuming reel 1 exists or just checking for constraint error before FK error
            type: t
        });
        
        if (error && error.message.includes('check constraint')) {
            console.log(`Type '${t}' failed check constraint.`);
        } else if (error && error.message.includes('foreign key')) {
            console.log(`Type '${t}' PASSED check constraint (but failed FK, which is fine for this test).`);
        } else if (!error) {
            console.log(`Type '${t}' WORKED.`);
            // cleanup if worked
            await supabase.from('user_interactions').delete().eq('type', t);
        } else {
            console.log(`Type '${t}' error: ${error.message}`);
        }
    }
}

checkConstraint();
