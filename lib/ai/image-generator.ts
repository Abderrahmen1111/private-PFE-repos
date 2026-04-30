/**
 * Image Generator — Génère des images via Cloudflare Workers AI
 * et les upload sur Supabase Storage.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Améliore le prompt pour de meilleurs résultats visuels (Produits & Promos)
 */
function enhancePrompt(prompt: string): string {
  const lower = prompt.toLowerCase()
  const isPromo = lower.includes('sale') || lower.includes('promo') || lower.includes('discount') || lower.includes('banner')
  
  if (isPromo) {
    return `${prompt}, vibrant colors, high contrast, professional graphic design, 8k resolution, commercial advertising style, sharp details, eye-catching composition`
  }

  // Product style
  return `${prompt}, professional product photography, studio lighting, bokeh background, sharp focus, 8k uhd, highly detailed textures, realistic materials, clean composition, minimalist aesthetic`
}

/**
 * Génère une image via Cloudflare Workers AI
 * @returns Buffer de l'image PNG ou null en cas d'erreur
 */
export async function generateImageFromPrompt(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.CLOUDFLARE_AI_KEY
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiKey || !accountId) {
    console.error('[ImageGen] CLOUDFLARE_AI_KEY or CLOUDFLARE_ACCOUNT_ID not configured')
    return null
  }

  const enhancedPrompt = enhancePrompt(prompt)
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`
  
  try {
    console.log(`[ImageGen] Calling Cloudflare AI...`)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        num_steps: 8, // SDXL Lightning performs best at 4-8 steps
      }),
      // Cloudflare is fast, but let's give it up to 60s
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error(`[ImageGen] Cloudflare error ${response.status}:`, errText.slice(0, 200))
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('image')) {
      const jsonText = await response.text().catch(() => '')
      console.error('[ImageGen] Response is not an image:', contentType, jsonText)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error('[ImageGen] Fetch error:', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Upload un Buffer image vers Supabase Storage
 * @returns URL publique de l'image ou null
 */
export async function uploadImageToSupabase(
  imageBuffer: Buffer,
  fileName: string
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[ImageGen] Supabase env vars missing')
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Sanitize filename to avoid issues with special characters (like accents)
  const sanitizedFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9.-]/gi, '-')   // Replace non-alphanumeric with dashes
    .toLowerCase()

  const filePath = `ai-generated/${Date.now()}-${sanitizedFileName}.png`

  const { error } = await supabase.storage
    .from('product-images') // Match BUCKETS.PRODUCTS in lib/supabase/storage.ts
    .upload(filePath, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[ImageGen] Upload error:', error.message)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Pipeline complet: prompt → image générée → URL Supabase
 */
export async function generateAndUploadImage(
  imagePrompt: string,
  fileName: string = 'ai-image'
): Promise<string | null> {
  try {
    const imageBuffer = await generateImageFromPrompt(imagePrompt)
    if (!imageBuffer) return null

    const url = await uploadImageToSupabase(imageBuffer, fileName)
    return url
  } catch (err) {
    console.error('[ImageGen] Pipeline error:', err)
    return null
  }
}
