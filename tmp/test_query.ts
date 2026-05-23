import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQuery() {
  console.log('--- Columns of support_tickets ---')
  const { data: cols, error: err } = await supabase
    .from('support_tickets')
    .select('*')
    .limit(0)
  
  // Let's also run a raw query to select column_name from information_schema.columns
  const { data: rawCols, error: rawErr } = await supabase.rpc('inspect_table_columns_raw', { table_name_input: 'support_tickets' } as any)
  if (rawErr) {
    // Let's print the keys of a select all with a single record or select limit 1
    const { data: record } = await supabase.from('support_tickets').select('*').limit(1)
    if (record && record.length > 0) {
      console.log('Columns from record keys:', Object.keys(record[0]))
    }
  } else {
    console.log('Raw columns:', rawCols)
  }
}

testQuery()
