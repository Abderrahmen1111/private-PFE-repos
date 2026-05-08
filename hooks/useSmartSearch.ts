import { useState, useCallback } from 'react'

interface SearchResult {
  id: number
  name?: string
  title?: string
  description?: string
  finalScore: number
  semanticScore: number
  textScore: number
  distance_km?: number
  [key: string]: any
}

interface ProcessingInfo {
  original: string
  normalized: string
  corrected: string
  enriched: string
}

export function useSmartSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [processing, setProcessing] = useState<ProcessingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (
    query: string,
    options?: {
      searchType?: 'all' | 'products' | 'businesses' | 'stores'
      limit?: number
      userLat?: number
      userLng?: number
      maxDistance?: number
      location?: string
      isSuggestion?: boolean
    }
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 Triggering Semantic Search API:', { query, options });
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          searchType: options?.searchType || 'all',
          limit: options?.limit || 20,
          userLat: options?.userLat,
          userLng: options?.userLng,
          maxDistance: options?.maxDistance,
          location: options?.location,
          isSuggestion: options?.isSuggestion,
        }),
      })

      if (!response.ok) {
        console.error('❌ Semantic Search API Failed:', response.status);
        throw new Error('Search failed');
      }

      const data = await response.json()
      console.log('✅ Semantic Search Results:', data);
      
      setResults(data.results)
      setProcessing(data.processing)
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      return { results: [], processing: null }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    results,
    processing,
    isLoading,
    error,
    search,
  }
}
