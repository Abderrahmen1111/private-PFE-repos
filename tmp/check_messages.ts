import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMessages() {
  console.log('--- Checking Support Messages Structure ---')
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Sample Messages:', data)
    if (data && data.length > 0) {
      console.log('Available Columns:', Object.keys(data[0]))
    } else {
      console.log('No messages found in support_messages table.')
    }
  }
}

checkMessages()
