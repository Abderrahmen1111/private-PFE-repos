import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    const { data: rc } = await supabase.from('reel_comments').select('*').limit(1)
    console.log('REEL_COMMENTS COLUMNS:', rc && rc.length > 0 ? Object.keys(rc[0]) : 'No rows to inspect')

    const { data: rev } = await supabase.from('reviews').select('*').limit(1)
    console.log('REVIEWS COLUMNS:', rev && rev.length > 0 ? Object.keys(rev[0]) : 'No rows to inspect')
}

inspect()
