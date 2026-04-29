import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { 
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
  normalizeDarijaWord 
} from '@/lib/darija-dictionary'
import { generateQueryEmbedding } from '@/lib/openrouter-embeddings'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    console.log('🔍 Original:', query)

    // ========== ÉTAPE 1: PRÉ-NORMALISATION AVEC DICTIONNAIRE ==========
    const preNormalized = preNormalizeWithDictionary(query)
    console.log('📖 Pre-normalized:', preNormalized)

    // ========== ÉTAPE 2: NORMALISATION IA (optionnelle, graceful degradation) ==========
    let normalized = preNormalized
    try {
      normalized = await normalizeDarijaAdvanced(preNormalized)
      console.log('🇹🇳 Normalized:', normalized)
    } catch(e) {
      console.warn('⚠️ Gemini normalization skipped:', (e as Error).message?.substring(0, 80))
    }

    // ========== ÉTAPE 3: RECHERCHE VECTORIELLE (OPENROUTER) ==========
    // On utilise la query normalisée + l'originale pour l'embedding
    const searchText = normalized !== preNormalized ? normalized : query
    
    let vectorResults: any[] = []
    let embedding: number[] | null = null
    
    try {
      embedding = await generateQueryEmbedding(searchText)
      console.log('🧠 Vectorial embedding generated:', embedding?.length, 'dims')
      
      // Recherche vectorielle via pgvector
      const supabase = createClient()
      const { data, error } = await supabase.rpc('search_items_semantic', {
        query_embedding: `[${embedding.join(',')}]`,
        item_type_filter: undefined,
        city_filter: undefined,
        match_threshold: 0.3,
        match_count: 20,
      })
      
      if (error) {
        console.error('pgvector RPC error:', error)
      } else {
        vectorResults = data || []
        console.log('✅ Vector search results:', vectorResults.length)
      }
    } catch(e) {
      console.error('Vector search error:', (e as Error).message?.substring(0, 120))
    }

    // ========== ÉTAPE 4: FALLBACK ILIKE SI PAS DE RÉSULTATS VECTORIELS ==========
    let fallbackResults: any[] = []
    if (vectorResults.length === 0) {
      console.log('🔄 Falling back to ilike search...')
      fallbackResults = await fallbackIlikeSearch(query, normalized)
    }

    // Merge results: vector first, then fallback (deduplicated)
    const seenIds = new Set(vectorResults.map(r => r.id))
    const mergedResults = [
      ...vectorResults,
      ...fallbackResults.filter(r => !seenIds.has(r.id))
    ]

    return NextResponse.json({
      results: mergedResults,
      processing: {
        original: query,
        preNormalized,
        normalized,
        searchMethod: vectorResults.length > 0 ? 'vector' : 'ilike_fallback',
        vectorResultCount: vectorResults.length,
        fallbackResultCount: fallbackResults.length,
        darijaWordsFound: extractDarijaWords(query),
      },
    })
  } catch (error) {
    console.error('[Smart Search Error]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

/**
 * PRÉ-NORMALISATION avec dictionnaire avant IA
 * Plus rapide et plus précis pour mots connus
 */
function preNormalizeWithDictionary(query: string): string {
  const words = query.split(/\s+/)
  
  const normalized = words.map(word => {
    const cleaned = word.toLowerCase().trim()
    
    // Si dans dictionnaire, remplacer
    if (DARIJA_TUNISIAN_DICTIONARY[cleaned]) {
      return DARIJA_TUNISIAN_DICTIONARY[cleaned].french
    }
    
    return word
  })
  
  return normalized.join(' ')
}

/**
 * NORMALISATION IA AVANCÉE (Gemini) - graceful degradation si quota dépassé
 */
async function normalizeDarijaAdvanced(query: string): Promise<string> {
  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const darijaWords = extractDarijaWords(query)
  
  const prompt = `Tu es un expert en darija tunisien.

REQUÊTE: "${query}"

${darijaWords.length > 0 ? 
'MOTS DARIJA DÉTECTÉS:\n' + darijaWords.map(w => '- ' + w.original + ' -> ' + w.french + ' (' + w.category + ')').join('\n') 
: ''}

TÂCHE:
1. Confirme les traductions ci-dessus
2. Détecte d'autres mots darija non répertoriés
3. Corrige variantes phonétiques (ex: "maftouh" → "ouvert")
4. Traduis TOUT vers français
5. Garde structure logique de la phrase
6. Réponds UNIQUEMENT avec la traduction française, sans aucun texte additionnel ni explication.

CONTEXTE: Recherche marketplace (commerces, produits, services, villes Tunisie)`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

/**
 * FALLBACK: Recherche ilike quand les embeddings ne donnent rien
 */
async function fallbackIlikeSearch(originalQuery: string, normalizedQuery: string): Promise<any[]> {
  const supabase = createClient()
  const rawQuery = normalizedQuery || originalQuery

  const noiseWords = new Set(['je', 'tu', 'il', 'elle', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du',
    'au', 'aux', 'mon', 'ma', 'mes', 'pour', 'trouver', 'veux', 'où', 'a', 'à', 'est', 'sont', 'y',
    'dans', 'avec', 'et', 'ou', 'moi', 'toi', 'en', 'par', 'sur', 'qui'])

  const keywords = rawQuery
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F]/g, '') // strip commas, parens, etc.
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1 && !noiseWords.has(w))

  // Also add original query for Arabic matching
  if (normalizedQuery !== originalQuery) {
    const cleanOriginal = originalQuery.replace(/[^\w\s\u0600-\u06FF\u0750-\u077F]/g, '').trim()
    if (cleanOriginal.length > 1) keywords.push(cleanOriginal.toLowerCase())
  }

  const effectiveKeywords = keywords.length > 0 ? keywords : [rawQuery.toLowerCase()]

  // Build one OR filter with all keywords
  const orFilters = effectiveKeywords.map(keyword =>
    `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
  ).join(',')

  const { data, error } = await supabase
    .from('items')
    .select('*, stores(name, rating_average)')
    .eq('status', 'AVAILABLE')
    .or(orFilters)
    .limit(20)

  if (error) {
    console.error('ilike fallback error:', error)
    return []
  }

  return data || []
}
