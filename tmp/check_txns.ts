import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTransactions() {
  console.log('--- Checking Transactions Table ---')
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Sample Transactions:', data)
  }
}

checkTransactions()
