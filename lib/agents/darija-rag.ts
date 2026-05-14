import { createClient } from '@/lib/supabase/server'
import { DARIJA_TUNISIAN_DICTIONARY } from '@/lib/darija-dictionary'
import { generateQueryEmbedding } from '@/lib/openrouter-embeddings'

export interface DarijaWord {
  darija: string
  french: string
  category: string
}

export interface DarijaPhrase {
  darija_phrase: string
  french_meaning: string
  similarity: number
}

export interface DarijaLookupResult {
  words: DarijaWord[]
  phrases: DarijaPhrase[]
}

/**
 * Performs a two-tier lookup for Darija text:
 * 1. Exact word matches from the 106K in-memory dictionary.
 * 2. Semantic phrase matches from the 435K Supabase vector table.
 */
export async function lookupDarija(text: string, limit: number = 5): Promise<DarijaLookupResult> {
  const cleanText = text.trim()
  if (!cleanText || cleanText.length < 2) {
    return { words: [], phrases: [] }
  }

  // ── 1. Dictionary lookup (instant) ──────────────────────────
  const tokens = cleanText.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  const words: DarijaWord[] = tokens
    .map(token => {
      const entry = DARIJA_TUNISIAN_DICTIONARY[token]
      return entry ? { darija: token, french: entry.french, category: entry.category } : null
    })
    .filter((w): w is DarijaWord => w !== null)

  // ── 2. Vector search in Supabase ───────────────────────────
  let phrases: DarijaPhrase[] = []
  
  try {
    const embedding = await generateQueryEmbedding(cleanText)
    if (embedding && embedding.length > 0) {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('search_darija_phrases' as any, {
        query_embedding: `[${embedding.join(',')}]`,
        match_threshold: 0.6,
        match_count: limit,
      })
      if (!error && data) {
        phrases = data.map((r: any) => ({
          darija_phrase: r.darija_phrase,
          french_meaning: r.french_meaning,
          similarity: r.similarity,
        }))
      }
    }
  } catch (e) {
    console.warn('[Darija RAG] Vector search failed:', e)
  }

  return { words, phrases }
}

/**
 * Formats the lookup results into a string block for system prompts.
 */
export function formatDarijaContext(results: DarijaLookupResult): string {
  if (results.words.length === 0 && results.phrases.length === 0) return ''

  let block = '\n=== DARIJA CONTEXT (RAG) ===\n'
  
  if (results.words.length > 0) {
    block += 'Words detected:\n'
    results.words.forEach(w => {
      block += `- "${w.darija}": ${w.french} (${w.category})\n`
    })
  }

  if (results.phrases.length > 0) {
    block += '\nSimilar phrases/meanings:\n'
    results.phrases.forEach(p => {
      block += `- "${p.darija_phrase}": ${p.french_meaning}\n`
    })
  }

  return block + '============================\n'
}
