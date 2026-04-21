import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { 
  DARIJA_TUNISIAN_DICTIONARY,
  extractDarijaWords,
} from '@/lib/darija-dictionary'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ─── In-memory cache for AI-processed queries ────────────────────────────────
// TTL: 1 hour — avoids hitting Gemini for repeated identical queries
interface CacheEntry { normalized: string; enriched: string; ts: number }
const aiCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getCached(key: string): CacheEntry | null {
  const entry = aiCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) { aiCache.delete(key); return null }
  return entry
}

function setCache(key: string, value: Omit<CacheEntry, 'ts'>) {
  // Evict oldest entry if cache exceeds 500 items
  if (aiCache.size >= 500) aiCache.delete(aiCache.keys().next().value!)
  aiCache.set(key, { ...value, ts: Date.now() })
}
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ results: [], processing: null })
    }

    console.log('🔍 Original:', query)

    // ===== ÉTAPE 1: PRÉ-NORMALISATION AVEC DICTIONNAIRE ==========
    const preNormalized = preNormalizeWithDictionary(query)
    console.log('📖 Pre-normalized:', preNormalized)

    // ===== ÉTAPE 2: TRAITEMENT IA CONSOLIDÉ (avec cache) ==========
    const { normalized, enriched } = await processQueryWithAI(preNormalized)
    console.log('✅ Final query:', enriched)

    // ===== ÉTAPE 3: RECHERCHE ==========
    const results = await hybridSearch({
      originalQuery: query,
      enrichedQuery: enriched,
    })

    return NextResponse.json({
      results,
      processing: {
        original: query,
        preNormalized,
        normalized,
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
 * TRAITEMENT IA CONSOLIDÉ (Gemini 1.5 Flash)
 * - Vérifie le cache avant d'appeler l'IA (évite les appels redondants)
 * - Fallback gracieux si quota 429 ou erreur réseau
 */
async function processQueryWithAI(query: string): Promise<{ normalized: string, enriched: string }> {
  const cacheKey = query.toLowerCase().trim()

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const cached = getCached(cacheKey)
  if (cached) {
    console.log('⚡ Cache hit for:', query)
    return { normalized: cached.normalized, enriched: cached.enriched }
  }

  const darijaWords = extractDarijaWords(query)
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Tu es un expert en darija tunisien et en recherche sémantique SEO.

REQUÊTE À TRAITER: "${query}"

${darijaWords.length > 0 ?
'MOTS DARIJA DÉTECTÉS:\n' + darijaWords.map(w => '- ' + w.original + ' -> ' + w.french).join('\n')
: ''}

TON RÔLE:
1. Traduis la requête en français correct (Normalisation).
2. Génère une version enrichie avec 4-5 mots-clés sémantiques associés.

FORMAT (UNIQUEMENT DU JSON):
{"normalized": "traduction simple", "enriched": "traduction + mots clés"}

Exemple:
Requête: "n7eb plombier taw"
Réponse: {"normalized": "je veux un plombier maintenant", "enriched": "plombier plomberie dépannage urgence réparation"}

Réponds UNIQUEMENT le JSON.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
    const parsed = JSON.parse(jsonStr)

    const output = {
      normalized: parsed.normalized || query,
      enriched: parsed.enriched || parsed.normalized || query,
    }
    // Store in cache
    setCache(cacheKey, output)
    return output
  } catch (e: any) {
    // Graceful fallback on 429 (quota) or any other error
    const is429 = e?.status === 429 || String(e).includes('429')
    if (is429) {
      console.warn('⚠️ Gemini quota exceeded — using pre-normalized query as fallback')
    } else {
      console.error('Gemini error:', e)
    }
    return { normalized: query, enriched: query }
  }
}

async function hybridSearch(params: { originalQuery: string, enrichedQuery: string }) {
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
