import { createClient } from '../lib/supabase/server'

async function inspect() {
    const supabase = createClient()
    const { data, error } = await (supabase as any)
        .from('reels')
        .select(`
            *,
            reel_stats (*)
        `)
        .limit(3)

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('REELS DATA SAMPLE:', JSON.stringify(data, null, 2))
}

inspect()
