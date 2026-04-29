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
    return kw ?? 'create_product'
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

async function extractWithOpenRouter(
  originalPrompt: string,
  translatedPrompt: string,
  darijaWords: Array<{ original: string; french: string; category: string }>,
  intent: DarijaIntent
): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  // Use the same model as the rest of the app (env-configured), fallback to free llama
  const model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-8b-instruct:free'
  const darijaContext = darijaWords.length
    ? `Mots Darija détectés: ${darijaWords.map(w => `${w.original}=${w.french}`).join(', ')}.`
    : ''

  const schemaInstructions = intent === 'create_product'
    ? `Return ONLY valid JSON (no markdown):
{
  "name": "product name in French (capitalized)",
  "description": "short description in French (1-2 sentences)",
  "price": <number or null>,
  "category": "category in French",
  "image_prompt": "English prompt for image generation. Describe the item specifically (material, color, lighting). Style: professional product photo, high-end studio lighting, clean background, 8k."
}`
    : `Return ONLY valid JSON (no markdown):
{
  "title": "promotion title in French",
  "description": "offer description in French",
  "discount_percent": <number or null>,
  "discount_text": "alternative text if no % (e.g. 2 for 1) or null",
  "image_prompt": "English prompt for promotional image. Use vibrant colors, describe the discount and vibe. Style: premium sale banner, commercial marketing style, bold typography."
}`

  const systemPrompt = `You are an assistant for a Tunisian marketplace (Ro2ya).
The user writes in Tunisian Darija (mix of Arabic, French, and phonetic).
Translated approximation: "${translatedPrompt}".
${darijaContext}
${schemaInstructions}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Ro2ya Darija AI Parser',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt original (Darija): "${originalPrompt}"` },
      ],
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    const err = new Error(`OpenRouter error ${res.status}: ${errText.slice(0, 200)}`)
    ;(err as any).status = res.status
    throw err
  }

  const data = await res.json()
  const rawContent: string = data.choices?.[0]?.message?.content ?? '{}'

  // Groq with json_object format should return clean JSON, but strip markdown just in case
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

  // 3. Structured extraction: OpenRouter → fallback Gemini
  let parsed: Record<string, unknown>
  try {
    parsed = await extractWithOpenRouter(prompt, translatedText, darijaWords, intent)
  } catch (orErr) {
    const status = (orErr as any).status
    console.warn(`[Darija Parser] OpenRouter failed (${status}), trying Gemini fallback:`, (orErr as Error).message)
    try {
      parsed = await extractWithGemini(prompt, translatedText, darijaWords, intent)
      console.log('[Darija Parser] Gemini fallback succeeded')
    } catch (geminiErr) {
      console.error('[Darija Parser] Gemini fallback also failed:', (geminiErr as Error).message)
      return { intent: 'unknown', raw: (geminiErr as Error).message }
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
