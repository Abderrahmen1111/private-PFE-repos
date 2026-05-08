import { NextRequest, NextResponse } from 'next/server'
import { doGlobalSemanticSearch } from '@/lib/actions/search'

export async function POST(req: NextRequest) {
  try {
    const { query, location, category, userLat, userLng, isSuggestion } = await req.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results = await doGlobalSemanticSearch(query, location, category, userLat, userLng, !!isSuggestion)

    return NextResponse.json({
      results,
      count: results.length,
      processing: 'semantic-hybrid-rrf-llm'
    })
  } catch (error: any) {
    console.error('❌ Semantic Search API Error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    )
  }
}
