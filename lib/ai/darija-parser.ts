/**
 * Darija Parser — Analyse un prompt en Darija tunisien
 *
 * Pipeline:
 * 1. Pré-traitement : traduction Darija → Français via le dictionnaire local
 * 2. Classification d'intention : baai/bge-m3 embeddings (cosine similarity)
 * 3. Extraction structurée : OpenRouter (gemini-2.0-flash ou llama-3.1-8b) + fallback Gemini direct
 */

import { translateDarijaForSearch, extractDarijaWords } from '@/lib/darija-dictionary'
import { generateEmbedding } from '@/lib/openrouter-embeddings'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DarijaIntent = 'create_product' | 'create_promotion' | 'unknown'

export interface ParsedProductData {
  intent: 'create_product'
  name: string
  description: string
  price?: number
  category?: string
  image_prompt: string
}

export interface ParsedPromotionData {
  intent: 'create_promotion'
  title: string
  description: string
  discount_percent?: number
  discount_text?: string
  image_prompt: string
}

export type ParsedDarijaResult =
  | ParsedProductData
  | ParsedPromotionData
  | { intent: 'unknown'; raw: string }

// ─── Anchor sentences for intent classification (baai/bge-m3) ─────────────────
// These are embedded once and compared via cosine similarity to the user prompt.

const INTENT_ANCHORS: Record<DarijaIntent, string> = {
  create_product:
    'add a new product listing to the catalog with a name, price and description',
  create_promotion:
    'create a discount promotion offer with percentage reduction and validity dates',
  unknown: '',
}

// ─── Cosine Similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10)
}

// ─── Keyword fallback (instantaneous, no API call) ───────────────────────────

const PRODUCT_KW = ['produit', 'jdid', 'zid', '3mel', 'dir', 'article', 'item', 'bijou', 'kasket', 'sabat', 'tilfon', 'telephone', 'هاتف', 'منتج', 'جديد']
const PROMO_KW   = ['promo', 'promotion', 'solde', 'takhfidh', 'remise', 'offre', 'réduction', 'reduction', 'discount', '%', 'تخفيض', 'عرض']

function keywordIntent(text: string): DarijaIntent | null {
  const lower = text.toLowerCase()
  const pScore = PROMO_KW.filter(k => lower.includes(k)).length
  const prodScore = PRODUCT_KW.filter(k => lower.includes(k)).length
  if (pScore > prodScore) return 'create_promotion'
  if (prodScore > pScore) return 'create_product'
  if (lower.includes('%')) return 'create_promotion'
  return null
}

// ─── Intent classification via baai/bge-m3 ───────────────────────────────────

async function classifyIntentWithEmbeddings(translatedPrompt: string): Promise<DarijaIntent> {
  // Fast keyword pass first
  const kw = keywordIntent(translatedPrompt)

  try {
    const [promptVec, productVec, promoVec] = await Promise.all([
      generateEmbedding(translatedPrompt),
      generateEmbedding(INTENT_ANCHORS.create_product),
      generateEmbedding(INTENT_ANCHORS.create_promotion),
    ])

    const simProduct = cosineSimilarity(promptVec, productVec)
    const simPromo   = cosineSimilarity(promptVec, promoVec)

    console.log(`[Darija Parser] BGE-M3 similarity → product: ${simProduct.toFixed(3)}, promo: ${simPromo.toFixed(3)}`)

    // If embeddings agree with keywords or embeddings are decisive → trust them
    const embeddingIntent: DarijaIntent = simPromo > simProduct ? 'create_promotion' : 'create_product'

    // Require a minimum confidence gap (0.02) otherwise trust keywords
    if (Math.abs(simProduct - simPromo) < 0.02 && kw) return kw
    return embeddingIntent

  } catch (err) {
    console.warn('[Darija Parser] Embedding classification failed, using keywords:', (err as Error).message)
    // Default to product if keywords fail but text exists
    return kw ?? (translatedPrompt.trim().length > 3 ? 'create_product' : 'unknown')
  }
}

// ─── Local price/discount extraction (regex, no API cost) ────────────────────

function extractPrice(text: string): number | undefined {
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:dt|dinar|دينار|TND|tnd)/i,
    /b\s+(\d+(?:[.,]\d+)?)/i,
    /prix[:\s]+(\d+(?:[.,]\d+)?)/i,
    /(\d+)\s*dinars?/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return parseFloat(m[1].replace(',', '.'))
  }
  return undefined
}

function extractDiscount(text: string): number | undefined {
  const m = text.match(/(\d+)\s*%/)
  return m ? parseInt(m[1]) : undefined
}

// ─── Gemini fallback extraction ──────────────────────────────────────────────

async function extractWithGemini(
  originalPrompt: string,
  translatedPrompt: string,
  darijaWords: Array<{ original: string; french: string; category: string }>,
  intent: DarijaIntent
): Promise<Record<string, unknown>> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) throw new Error('GEMINI_API_KEY not configured')

  const darijaContext = darijaWords.length
    ? `Mots Darija détectés: ${darijaWords.map(w => `${w.original}=${w.french}`).join(', ')}.`
    : ''

  const schemaInstructions = intent === 'create_product'
    ? `{"name":"...","description":"...","price":null,"category":"...","image_prompt":"..."}`
    : `{"title":"...","description":"...","discount_percent":null,"discount_text":null,"image_prompt":"..."}`

  const userText = `Prompt Darija: "${originalPrompt}"
Traduction approximative: "${translatedPrompt}"
${darijaContext}
Réponds UNIQUEMENT avec du JSON valide (pas de markdown) selon ce schéma: ${schemaInstructions}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.2 },
    }),
  })

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
  const data = await res.json()
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(jsonStr) as Record<string, unknown>
}

// ─── OpenRouter extraction (llama-3.1-8b ou gemini-2.0-flash via OpenRouter) ──────
// Utilise la même clé OPENROUTER_API_KEY que les embeddings baai/bge-m3.
// Free tier généreux, pas de 429 ni de problème d'auth.

async function extractWithCloudflare(
  originalPrompt: string,
  translatedPrompt: string,
  darijaWords: Array<{ original: string; french: string; category: string }>,
  intent: DarijaIntent
): Promise<Record<string, unknown>> {
  const apiKey = process.env.CLOUDFLARE_AI_KEY
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!apiKey || !accountId) throw new Error('Cloudflare non configuré (CLOUDFLARE_AI_KEY / ACCOUNT_ID)')

  const model = '@cf/meta/llama-3.1-8b-instruct'
  const darijaContext = darijaWords.length
    ? `Mots Darija détectés: ${darijaWords.map(w => `${w.original}=${w.french}`).join(', ')}.`
    : ''

  const schemaInstructions = intent === 'create_product'
    ? `Return ONLY valid JSON:
{
  "name": "product name in French",
  "description": "short description in French",
  "price": <number or null>,
  "category": "category in French",
  "image_prompt": "English prompt for professional product photo"
}`
    : `Return ONLY valid JSON:
{
  "title": "promotion title in French",
  "description": "offer description in French",
  "discount_percent": <number or null>,
  "discount_text": "text if no % or null",
  "image_prompt": "English prompt for premium sale banner"
}`

  const systemPrompt = `You are a Tunisian marketplace assistant. Parse this Darija prompt into JSON.
Translated: "${translatedPrompt}". ${darijaContext}
${schemaInstructions}`

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: originalPrompt },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Cloudflare AI error: ${res.status}`)
  const data = await res.json()
  const rawContent: string = data.result?.response ?? '{}'
  
  // Clean potential markdown
  const jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(jsonStr) as Record<string, unknown>
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function parseDarijaPrompt(prompt: string): Promise<ParsedDarijaResult> {
  // 1. Local pre-processing (no API call)
  const translatedText = translateDarijaForSearch(prompt)
  const darijaWords    = extractDarijaWords(prompt)
  const price          = extractPrice(prompt)
  const discount       = extractDiscount(prompt)

  // 2. Intent classification: baai/bge-m3 embeddings + keyword fallback
  const intent = await classifyIntentWithEmbeddings(translatedText)
  console.log(`[Darija Parser] Intent → ${intent}`)

  // 3. Structured extraction: Cloudflare (Primary) → Fallback Gemini
  let parsed: Record<string, unknown>
  try {
    parsed = await extractWithCloudflare(prompt, translatedText, darijaWords, intent)
    console.log('[Darija Parser] Cloudflare extraction succeeded')
  } catch (cfErr) {
    console.warn(`[Darija Parser] Cloudflare failed, trying Gemini fallback:`, (cfErr as Error).message)
    try {
      parsed = await extractWithGemini(prompt, translatedText, darijaWords, intent)
      console.log('[Darija Parser] Gemini fallback succeeded')
    } catch (geminiErr) {
      const isQuota = (geminiErr as Error).message.includes('429');
      console.error('[Darija Parser] Gemini fallback also failed:', (geminiErr as Error).message)
      return { 
        intent: 'unknown', 
        raw: isQuota ? "QUOTA_EXCEEDED_429" : "Désolé, je n'ai pas pu extraire les détails. Essayez d'être plus précis (ex: 'PC Acer b 1200 DT')" 
      }
    }
  }

  // 4. Merge local regex extractions (more reliable for numbers)
  if (intent === 'create_product') {
    return {
      intent: 'create_product',
      name:         (parsed.name as string)        || 'Nouveau produit',
      description:  (parsed.description as string) || '',
      price:        price ?? (parsed.price as number | undefined) ?? undefined,
      category:     (parsed.category as string)    || '',
      image_prompt: (parsed.image_prompt as string) ||
        `professional product photo of ${parsed.name ?? 'item'}, clean white background, high quality`,
    } satisfies ParsedProductData

  } else {
    return {
      intent: 'create_promotion',
      title:          (parsed.title as string)          || 'Nouvelle Promotion',
      description:    (parsed.description as string)    || '',
      discount_percent: discount ?? (parsed.discount_percent as number | undefined) ?? undefined,
      discount_text:  (parsed.discount_text as string)  || undefined,
      image_prompt:   (parsed.image_prompt as string)   ||
        'vibrant sale promotion banner, discount offer, red and gold colors',
    } satisfies ParsedPromotionData
  }
}
