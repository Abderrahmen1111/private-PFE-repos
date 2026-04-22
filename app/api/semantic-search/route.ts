import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { 
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
  normalizeDarijaWord 
} from '@/lib/darija-dictionary'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    console.log('🔍 Original:', query)

    // ========== ÉTAPE 1: PRÉ-NORMALISATION AVEC DICTIONNAIRE ==========
    const preNormalized = preNormalizeWithDictionary(query)
    console.log('📖 Pre-normalized:', preNormalized)

    // ========== ÉTAPE 2: NORMALISATION IA AVANCÉE ==========
    const normalized = await normalizeDarijaAdvanced(preNormalized)
    console.log('🇹🇳 Normalized:', normalized)

    // ========== ÉTAPE 3: CORRECTION + ENRICHISSEMENT ==========
    const corrected = await correctSpelling(normalized)
    const enriched = await enrichContext(corrected)
    
    console.log('✅ Final query:', enriched)

    // ========== ÉTAPE 4: RECHERCHE ==========
    const embedding = await generateEmbedding(enriched)
    const results = await hybridSearch({
      originalQuery: query,
      enrichedQuery: enriched,
      embedding,
    })

    return NextResponse.json({
      results,
      processing: {
        original: query,
        preNormalized,
        normalized,
        corrected,
        enriched,
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
 * NORMALISATION IA AVANCÉE (Gemini)
 * Pour gérer cas complexes que le dictionnaire ne couvre pas
 */
async function normalizeDarijaAdvanced(query: string): Promise<string> {
  const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // Extraire mots darija détectés
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

  try {
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch(e) {
    console.error('Gemini error:', e)
    return query // fallback to original if LLM fails
  }
}

/**
 * Mocks & Helpers for remaining processes
 */
async function correctSpelling(text: string): Promise<string> {
    // Basic fallback, ideally you'd use a spell-checking library or another prompt
    return text.trim();
}

async function enrichContext(text: string): Promise<string> {
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `Tu es un expert SEO et recherche sémantique.
Prends cette recherche traduite : "${text}"

TÂCHE: Enrichis-la avec 4 ou 5 mots-clés hyper-pertinents (synonymes, concepts associés, termes de métier) pour améliorer la recherche dans une base de données (marketplace/services). 
Exemple: "je veux plombier ouvert maintenant" -> "plombier plomberie dépannage urgence disponible ouvert maintenant 24h immédiat"

Réponds UNIQUEMENT avec la chaîne de mots-clés mise bout à bout, sans phrases explicatives. Ne change pas le contexte.`;

    try {
      const result = await model.generateContent(prompt)
      return result.response.text().replace(/\n/g, ' ').trim()
    } catch(e) {
      console.error('Gemini enrich error:', e)
      return text;
    }
}

async function generateEmbedding(text: string): Promise<number[] | null> {
    // Without an actual embedding model key, we can't reliably generate pgvector embeddings here.
    // If you use OpenAI / google embeddings, you would call that SDK instead.
    // Returning dummy / null
    return null;
}

async function hybridSearch(params: { originalQuery: string, enrichedQuery: string, embedding: number[] | null }) {
    const supabase = createClient()

    const rawQuery = params.enrichedQuery || params.originalQuery;

    // Split enriched query into individual keywords and filter noise words
    const noiseWords = new Set(['je', 'tu', 'il', 'elle', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du',
        'au', 'aux', 'mon', 'ma', 'mes', 'pour', 'trouver', 'veux', 'où', 'a', 'à', 'est', 'sont', 'y',
        'dans', 'avec', 'et', 'ou', 'moi', 'toi', 'en', 'par', 'sur', 'qui']);
    const keywords = rawQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !noiseWords.has(w));

    const effectiveKeywords = keywords.length > 0 ? keywords : [rawQuery.toLowerCase()];

    // Chain one .or() per keyword so ANY keyword that matches surfaces the item
    let request = supabase
        .from('items')
        .select('*, stores(name, rating_average)')
        .eq('status', 'AVAILABLE')

    effectiveKeywords.forEach(keyword => {
        request = (request as any).or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    })

    const { data, error } = await (request as any).limit(20)

    if (error) {
        console.error('hybrid search fallback error:', error)
        return []
    }

    return data;
}
