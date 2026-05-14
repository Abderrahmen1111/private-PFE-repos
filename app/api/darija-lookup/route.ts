import { NextRequest, NextResponse } from 'next/server'
import { lookupDarija } from '@/lib/agents/darija-rag'
import { DARIJA_TUNISIAN_DICTIONARY } from '@/lib/darija-dictionary'

/**
 * POST /api/darija-lookup
 * 
 * Looks up Darija words and phrases from:
 * 1. In-memory dictionary (106K entries, instant)
 * 2. Supabase pgvector semantic search (435K phrases, ~200ms)
 * 
 * Used by the AI Agent to understand Darija user input.
 */
export async function POST(req: NextRequest) {
  let body: { text?: string; limit?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text = (body.text ?? '').trim()
  if (!text || text.length < 2) {
    return NextResponse.json({ words: [], phrases: [] })
  }

  const limit = Math.min(body.limit ?? 5, 10)
  const results = await lookupDarija(text, limit)

  return NextResponse.json(results)
}

/**
 * GET /api/darija-lookup?q=...
 * Convenience method for quick single-word lookups.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) return NextResponse.json({ found: false })

  const entry = DARIJA_TUNISIAN_DICTIONARY[q.toLowerCase()]
  if (entry) {
    return NextResponse.json({ found: true, word: q, ...entry })
  }

  return NextResponse.json({ found: false, word: q })
}
