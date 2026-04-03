import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testJoin() {
    console.log('Testing join with users on support_tickets...')
    
    // Attempt join with user_id or author_id or customer_id
    const variations = ['user_id', 'author_id', 'customer_id']
    
    for (const hint of variations) {
        console.log(`\nTrying join with hint: ${hint}`)
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`id, customer:users!${hint}(full_name, phone)`)
            .limit(1)
        
        if (error) {
            console.log(`Join with ${hint} failed: ${error.message}`)
        } else {
            console.log(`Join with ${hint} SUCCESS!`)
            return
        }
    }
}

testJoin()
