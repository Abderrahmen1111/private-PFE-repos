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
    }
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Modifié pour pointer vers la route API sémantique que nous venons de créer
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
        }),
      })

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      
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
