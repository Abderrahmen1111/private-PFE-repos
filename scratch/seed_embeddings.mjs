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

async function generateEmbeddingsBatch(texts) {
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
}

async function main() {
  console.log(`🚀 Seed Embeddings — OpenRouter ${EMBEDDING_MODEL}`)
  console.log('================================================\n')

  // 1. Fetch all items without embeddings
  console.log('📦 Fetching items without embeddings...')
  const items = await supabaseQuery(
    'items?select=id,name,description&embedding=is.null&order=id.asc&limit=5000'
  )
  
  console.log(`   Found ${items.length} items to process\n`)

  if (items.length === 0) {
    console.log('✅ All items already have embeddings!')
    return
  }

  let processed = 0
  let errors = 0

  // 2. Process in batches
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const texts = batch.map(item => {
      const name = item.name || ''
      const desc = item.description || ''
      return `${name} ${desc}`.trim()
    })

    try {
      const embeddings = await generateEmbeddingsBatch(texts)

      // 3. Update each item with its embedding
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j]
        const embedding = embeddings[j]

        await supabaseQuery(`items?id=eq.${item.id}`, {
          method: 'PATCH',
          body: { embedding: `[${embedding.join(',')}]` },
        })
      }

      processed += batch.length
      const pct = ((processed / items.length) * 100).toFixed(1)
      console.log(`   ✅ ${processed}/${items.length} (${pct}%) — batch ${Math.floor(i/BATCH_SIZE)+1}`)
    } catch (err) {
      errors++
      console.error(`   ❌ Batch error at offset ${i}:`, err.message?.substring(0, 100))
      // Wait and retry
      await new Promise(r => setTimeout(r, 2000))
    }

    // Rate limit: 200ms between batches
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n================================================`)
  console.log(`✅ Done! ${processed} items embedded, ${errors} errors`)
}

main().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
