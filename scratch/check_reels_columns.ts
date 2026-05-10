
import { createClient } from './lib/supabase/server'

async function checkReels() {
    const supabase = createClient()
    const { data, error } = await supabase.from('reels').select('*').limit(1)
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Reels columns:', Object.keys(data[0] || {}))
    }
}

checkReels()
