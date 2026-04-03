import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQuery() {
  console.log('--- Testing Support Tickets Query (Service Role) ---')
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('store_id', 16)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Tickets for Store 16:', data)
  }
}

testQuery()
