#!/usr/bin/env node
/**
 * Script de migration: Darija Phrases → Supabase pgvector
 * 
 * Ce script prend les 435 479 phrases Darija du corpus 1M et les insère
 * dans la table `darija_phrases` de Supabase avec leurs embeddings vectoriels.
 * 
 * Usage: node scripts/migrate-darija-phrases.mjs
 * 
 * Prérequis:
 *   - SUPABASE_SERVICE_ROLE_KEY et NEXT_PUBLIC_SUPABASE_URL dans .env.local
 *   - Table darija_phrases créée (voir SQL ci-dessous)
 *   - GEMINI_API_KEY ou OPENROUTER_API_KEY pour les embeddings
 * 
 * SQL à exécuter d'abord dans Supabase:
 * -----------------------------------------------
 * CREATE TABLE IF NOT EXISTS darija_phrases (
 *   id BIGSERIAL PRIMARY KEY,
 *   darija_phrase TEXT NOT NULL,
 *   french_meaning TEXT NOT NULL,
 *   category TEXT DEFAULT 'phrases_embedding',
 *   embedding vector(768),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX ON darija_phrases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 * CREATE OR REPLACE FUNCTION search_darija_phrases(query_embedding vector(768), match_count int DEFAULT 5)
 * RETURNS TABLE(id bigint, darija_phrase text, french_meaning text, similarity float)
 * LANGUAGE sql STABLE AS $$
 *   SELECT id, darija_phrase, french_meaning,
 *     1 - (embedding <=> query_embedding) AS similarity
 *   FROM darija_phrases
 *   ORDER BY embedding <=> query_embedding
 *   LIMIT match_count;
 * $$;
 * -----------------------------------------------
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const [k, ...v] = l.split('=');
      return [k.trim(), v.join('=').trim()];
    })
);

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];
const GEMINI_KEY   = env['GEMINI_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Generate embedding via Gemini ──────────────────────────────────────────────
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/embedding-001',
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embedding failed: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.embedding?.values;
}

// ── Batch insert ───────────────────────────────────────────────────────────────
async function batchInsert(batch) {
  const { error } = await supabase.from('darija_phrases').insert(batch);
  if (error) throw new Error(`Supabase insert error: ${error.message}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📖 Loading corpus...');
  const corpusPath = resolve(__dirname, '../../../Desktop/darija-corpus-1M.json');
  const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
  
  const phrases = Object.entries(corpus)
    .filter(([k, v]) => v.category === 'phrases_embedding')
    .map(([k, v]) => ({ darija_phrase: k, french_meaning: v.french }));
  
  console.log(`✅ Loaded ${phrases.length} phrases to migrate`);
  
  const BATCH_SIZE = 50;  // 50 phrases per batch (each needs an embedding call)
  const EMBED_BATCH = 10; // Process 10 at a time to avoid rate limits
  let processed = 0;
  let errors = 0;
  
  for (let i = 0; i < phrases.length; i += EMBED_BATCH) {
    const chunk = phrases.slice(i, i + EMBED_BATCH);
    
    const embedded = await Promise.all(
      chunk.map(async (phrase) => {
        try {
          const embedding = await generateEmbedding(
            `${phrase.darija_phrase} - ${phrase.french_meaning}`
          );
          return { ...phrase, embedding: `[${embedding.join(',')}]`, category: 'phrases_embedding' };
        } catch (e) {
          if (errors < 5) console.error(`[Embedding Error Sample] ${e.message}`);
          errors++;
          return null;
        }
      })
    );
    
    const valid = embedded.filter(Boolean);
    if (valid.length > 0) {
      try {
        await batchInsert(valid);
        processed += valid.length;
      } catch (e) {
        console.error('Insert error:', e.message);
        errors += valid.length;
      }
    }
    
    if (i % 1000 === 0) {
      const pct = ((i / phrases.length) * 100).toFixed(1);
      console.log(`⏳ Progress: ${i}/${phrases.length} (${pct}%) | Inserted: ${processed} | Errors: ${errors}`);
      await new Promise(r => setTimeout(r, 500)); // Rate limit pause
    }
  }
  
  console.log(`\n✅ Migration complete! Inserted: ${processed} | Errors: ${errors}`);
}

main().catch(console.error);
