/**
 * Seed Embeddings — Génère les embeddings via OpenRouter (BGE-M3) pour tous les items
 * 
 * Usage: node scratch/seed_embeddings.mjs
 * 
 * Prérequis: 
 *   1. Vérifier que la colonne 'embedding' (vector 1024) existe dans la table 'items'
 *   2. Avoir OPENROUTER_API_KEY et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/embeddings'
const EMBEDDING_MODEL = 'baai/bge-m3'
const DIMENSIONS = 1024
const BATCH_SIZE = 50 
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENROUTER_KEY) {
  console.error('❌ Missing env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY')
  process.exit(1)
}

async function supabaseQuery(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=minimal',
      ...options.headers,
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase error (${res.status}): ${err}`)
  }
  if (options.method === 'PATCH') return null
  return res.json()
}

async function generateEmbeddingsBatch(texts, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Seed Embeddings Tool',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: texts,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`OpenRouter API error (${res.status}): ${err}`)
      }

      const data = await res.json()
      return data.data.map(d => d.embedding)
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`      ⚠️ OpenRouter timeout/error (attempt ${attempt}/${retries}). Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function processEmbeddings(tableName, selectFields, textFields) {
  console.log(`📦 Fetching ${tableName} without embeddings...`)
  const idCol = tableName === 'service_directory' ? 'service_id' : 'id'
  const records = await supabaseQuery(
    `${tableName}?select=${selectFields}&embedding=is.null&order=${idCol}.asc&limit=5000`
  )
  
  console.log(`   Found ${records.length} ${tableName} to process\n`)

  if (records.length === 0) {
    console.log(`✅ All ${tableName} already have embeddings!`)
    return
  }

  let processed = 0
  let errors = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const texts = batch.map(record => {
      return textFields.map(field => record[field] || '').join(' ').trim()
    })

    try {
      const embeddings = await generateEmbeddingsBatch(texts)

      await Promise.all(batch.map((record, j) => {
        const embedding = embeddings[j]
        return supabaseQuery(`${tableName}?${idCol}=eq.${record[idCol]}`, {
          method: 'PATCH',
          body: { embedding: `[${embedding.join(',')}]` },
        })
      }))

      processed += batch.length
      const pct = ((processed / records.length) * 100).toFixed(1)
      console.log(`   ✅ ${processed}/${records.length} (${pct}%) — batch ${Math.floor(i/BATCH_SIZE)+1}`)
    } catch (err) {
      errors++
      console.error(`   ❌ Batch error at offset ${i}:`, err.message)
      if (err.cause) console.error(`      Cause:`, err.cause.message || err.cause)
      await new Promise(r => setTimeout(r, 5000)) // longer wait on hard failure
    }

    await new Promise(r => setTimeout(r, 500))
  }
}

async function main() {
  console.log(`🚀 Seed Embeddings — OpenRouter ${EMBEDDING_MODEL}`)
  console.log('================================================\n')

  // 1. Items (Produits & Services internes)
  await processEmbeddings('items', 'id,name,description', ['name', 'description'])
  
  console.log('\n------------------------------------------------\n')

  // 2. Stores (Boutiques internes)
  await processEmbeddings('stores', 'id,name,description,category,city', ['name', 'description', 'category', 'city'])

  console.log('\n------------------------------------------------\n')

  // 3. Business Directory (Données externes Google/Scraped)
  await processEmbeddings(
    'business_directory_tunisia', 
    'id,title,description,categoryName,city,full_address,vitrine_category', 
    ['title', 'description', 'categoryName', 'city', 'full_address', 'vitrine_category']
  )

  console.log('\n------------------------------------------------\n')

  // 4. Service Directory
  await processEmbeddings(
    'service_directory', 
    'service_id,name,description,category,city,address', 
    ['name', 'description', 'category', 'city', 'address']
  )

  console.log(`\n================================================`)
  console.log(`✅ Seeding complete!`)
}

main().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
