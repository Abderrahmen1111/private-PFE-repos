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
  const models = [
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    '@cf/bytedance/stable-diffusion-xl-lightning',
    '@cf/lykon/dreamshaper-8-lcm'
  ]

  let lastErr = null
  for (const model of models) {
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
    try {
      console.log(`[ImageGen] 🎨 Génération via Cloudflare (${model})...`)
      
      const numSteps = model.includes('lightning') ? 4 : model.includes('lcm') ? 8 : 20;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          num_steps: numSteps,
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(`Cloudflare Error ${response.status}: ${errText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('image')) {
        const jsonText = await response.text().catch(() => '')
        throw new Error(`Response is not an image: ${contentType} - ${jsonText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (err: any) {
      console.warn(`[ImageGen] Model ${model} failed, trying next... Error:`, err.message || err)
      lastErr = err
    }
  }

  console.error('[ImageGen] All models failed in generateImageFromPrompt:', lastErr)
  return null
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
 * Upload un Buffer image vers Cloudinary
 * @returns URL sécurisée de l'image ou null
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  fileName: string
): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const preset = 'ro2ya_reels'

  if (!cloudName) {
    console.error('[ImageGen] Cloudinary env vars missing (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)')
    return null
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  
  try {
    const blob = new Blob([imageBuffer], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', blob, `${fileName}.png`)
    formData.append('upload_preset', preset)
    formData.append('public_id', `ai_${Date.now()}_${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`)

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`Cloudinary Error ${res.status}: ${errData.error?.message || JSON.stringify(errData)}`)
    }

    const data = await res.json()
    return data.secure_url
  } catch (err: any) {
    console.error('[ImageGen] Cloudinary upload error:', err.message || err)
    return null
  }
}

/**
 * Pipeline complet: prompt → image générée → URL (Cloudinary ou Supabase en fallback)
 */
export async function generateAndUploadImage(
  imagePrompt: string,
  fileName: string = 'ai-image'
): Promise<string | null> {
  try {
    const imageBuffer = await generateImageFromPrompt(imagePrompt)
    if (!imageBuffer) return null

    // Essayer Cloudinary d'abord, puis Supabase
    let url = await uploadImageToCloudinary(imageBuffer, fileName)
    if (!url) {
      console.warn('[ImageGen] Cloudinary upload failed, falling back to Supabase...')
      url = await uploadImageToSupabase(imageBuffer, fileName)
    }
    return url
  } catch (err) {
    console.error('[ImageGen] Pipeline error:', err)
    return null
  }
}

