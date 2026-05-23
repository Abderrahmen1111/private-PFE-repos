import { NextRequest, NextResponse } from 'next/server'
import { parseDarijaPrompt } from '@/lib/ai/darija-parser'
import { generateAndUploadImage } from '@/lib/ai/image-generator'

export const dynamic = 'force-dynamic'
// NOTE: Cannot use edge runtime because generateAndUploadImage uses Node.js Buffer
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { prompt?: string; storeId?: number; generateImage?: boolean }
    const { prompt, storeId, generateImage = true } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Le prompt est requis.' }, { status: 400 })
    }
    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'Prompt trop long (max 1000 caractères).' }, { status: 400 })
    }
    // 1. Parse le prompt Darija → données structurées via Gemini + dictionnaire
    console.log('[AI Darija] 🟢 Étape 1: Analyse du prompt via Gemini...')
    const parsed = await parseDarijaPrompt(prompt)
    console.log('[AI Darija] 🟢 Résultat Gemini:', JSON.stringify(parsed, null, 2))

    if (parsed.intent === 'unknown') {
      console.log('[AI Darija] ⚠️ Intention inconnue')
      return NextResponse.json({
        intent: 'unknown',
        message: "Je n'ai pas pu comprendre votre demande. Essayez de décrire un produit ou une promotion.",
        raw: (parsed as any).raw,
      }, { status: 422 })
    }

    // 1b. Chat intent — return conversational response immediately (no image)
    if (parsed.intent === 'chat') {
      console.log('[AI Darija] 💬 Chat response')
      return NextResponse.json({ intent: 'chat', message: (parsed as any).message })
    }

    // 2. Générer l'image si demandé
    let image_url: string | null = null
    if (generateImage && (parsed as any).image_prompt) {
      console.log('[AI Darija] 🟢 Étape 2: Génération de l\'image pour:', (parsed as any).image_prompt.slice(0, 80))
      const slug = parsed.intent === 'create_product'
        ? (parsed as any).name?.toLowerCase().replace(/\s+/g, '-') ?? 'product'
        : 'promo'
      
      try {
        image_url = await generateAndUploadImage((parsed as any).image_prompt, slug)
        console.log('[AI Darija] 🟢 Image URL:', image_url ?? '❌ ÉCHEC (retourné null)')
      } catch (imgErr) {
        console.error('[AI Darija] ❌ Erreur critique lors de la génération d\'image:', imgErr)
      }
    }

    // 3. Réponse finale
    return NextResponse.json({
      ...parsed,
      image_url,
      store_id: storeId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[AI Darija] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
