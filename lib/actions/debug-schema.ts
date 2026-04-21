'use server'
import { createClient } from '@/lib/supabase/server'

export async function debugReelsColumns() {
    const supabase = createClient()
    const { data, error } = await (supabase as any).from('reels').select('*').limit(1)
    if (error) {
        return { error: error.message, details: error.details }
    }
    if (data && data.length > 0) {
        return { columns: Object.keys(data[0]) }
    }
    
    // If no data, try to get from information_schema
    const { data: cols } = await (supabase as any).rpc('get_table_columns', { table_name: 'reels' })
    return { columns: cols || 'No data and RPC failed' }
}
