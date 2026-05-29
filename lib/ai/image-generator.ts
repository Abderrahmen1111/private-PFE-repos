/**
 * Image Generator — Génère des images via Fal.ai (FLUX.1 Pro / Dev)
 * avec fallback automatique sur Cloudflare Workers AI.
 * Upload sur Cloudinary ou Supabase Storage.
 */

import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────

const FAL_API_URL = 'https://fal.run'

/**
 * Fal.ai models config:
 *   - fal-ai/flux/pro  → FLUX.1 Pro  (meilleure qualité, plus lent)
 *   - fal-ai/flux/dev  → FLUX.1 Dev  (bon compromis, rapide)
 *   - fal-ai/flux/schnell → FLUX.1 Schnell (le plus rapide, qualité OK)
 */
const FAL_MODELS = [
  'fal-ai/flux/dev',
  'fal-ai/flux/schnell',
]

const CLOUDFLARE_MODELS = [
  '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  '@cf/bytedance/stable-diffusion-xl-lightning',
  '@cf/lykon/dreamshaper-8-lcm',
]

// ─── Prompt Enhancement ───────────────────────────────────────────────────────

/**
 * Améliore le prompt pour de meilleurs résultats visuels (Produits & Promos)
 */
function enhancePrompt(prompt: string): string {
  const lower = prompt.toLowerCase()
  const isPromo = lower.includes('sale') || lower.includes('promo') || lower.includes('discount') || lower.includes('banner')

  if (isPromo) {
    return `${prompt}, vibrant colors, high contrast, professional graphic design, 8k resolution, commercial advertising style, sharp details, eye-catching composition`
  }

  return `${prompt}, professional product photography, studio lighting, bokeh background, sharp focus, 8k uhd, highly detailed textures, realistic materials, clean composition, minimalist aesthetic`
}

// ─── Fal.ai Provider ─────────────────────────────────────────────────────────

/**
 * Génère une image via Fal.ai (FLUX.1 Pro / Dev) en utilisant FAL_KEY
 * @returns Buffer PNG ou null en cas d'échec
 */
async function generateImageVisFal(prompt: string): Promise<Buffer | null> {
  const falKey = process.env.FAL_KEY
  if (!falKey) {
    console.warn('[ImageGen] FAL_KEY not configured, skipping Fal.ai')
    return null
  }

  const enhancedPrompt = enhancePrompt(prompt)

  for (const model of FAL_MODELS) {
    const url = `${FAL_API_URL}/${model}`
    try {
      console.log(`[ImageGen] 🎨 Génération via Fal.ai (${model})...`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_size: 'landscape_4_3',
          num_inference_steps: model.includes('schnell') ? 4 : 28,
          num_images: 1,
          enable_safety_checker: false,
          output_format: 'jpeg',
        }),
        signal: AbortSignal.timeout(90000), // 90s timeout
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(`Fal.ai HTTP ${response.status}: ${errText.slice(0, 200)}`)
      }

      const data = await response.json()

      // Fal.ai retourne { images: [{ url, content_type }] }
      const imageUrl: string = data?.images?.[0]?.url
      if (!imageUrl) {
        throw new Error(`Fal.ai: aucune image retournée. Réponse: ${JSON.stringify(data).slice(0, 200)}`)
      }

      // Télécharger l'image depuis l'URL retournée
      console.log(`[ImageGen] ✅ Fal.ai OK (${model}) — téléchargement de l'image...`)
      const imgResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) })
      if (!imgResponse.ok) throw new Error(`Impossible de télécharger l'image depuis Fal: ${imgResponse.status}`)

      const arrayBuffer = await imgResponse.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (err: any) {
      console.warn(`[ImageGen] Fal.ai (${model}) échoué → ${err.message}`)
    }
  }

  return null
}

// ─── Cloudflare Fallback ──────────────────────────────────────────────────────

/**
 * Génère une image via Cloudflare Workers AI (fallback)
 * @returns Buffer PNG ou null en cas d'échec
 */
async function generateImageViaCloudflare(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.CLOUDFLARE_AI_KEY
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiKey || !accountId) {
    console.warn('[ImageGen] CLOUDFLARE_AI_KEY ou CLOUDFLARE_ACCOUNT_ID non configurés')
    return null
  }

  const enhancedPrompt = enhancePrompt(prompt)

  for (const model of CLOUDFLARE_MODELS) {
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
    try {
      console.log(`[ImageGen] 🎨 Fallback via Cloudflare (${model})...`)
      const numSteps = model.includes('lightning') ? 4 : model.includes('lcm') ? 8 : 20

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: enhancedPrompt, num_steps: numSteps }),
        signal: AbortSignal.timeout(60000),
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(`Cloudflare HTTP ${response.status}: ${errText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('image')) {
        const jsonText = await response.text().catch(() => '')
        throw new Error(`Réponse non-image: ${contentType} — ${jsonText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.log(`[ImageGen] ✅ Cloudflare OK (${model})`)
      return Buffer.from(arrayBuffer)
    } catch (err: any) {
      console.warn(`[ImageGen] Cloudflare (${model}) échoué → ${err.message}`)
    }
  }

  return null
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Génère une image à partir d'un prompt.
 * Ordre de priorité : Fal.ai (FLUX.1) → Cloudflare Workers AI
 * @returns Buffer de l'image ou null en cas d'erreur
 */
export async function generateImageFromPrompt(prompt: string): Promise<Buffer | null> {
  // 1. Essayer Fal.ai (FLUX.1 Pro / Dev)
  const falBuffer = await generateImageVisFal(prompt)
  if (falBuffer) return falBuffer

  // 2. Fallback Cloudflare
  console.warn('[ImageGen] Fal.ai échoué — fallback Cloudflare Workers AI...')
  const cfBuffer = await generateImageViaCloudflare(prompt)
  if (cfBuffer) return cfBuffer

  console.error('[ImageGen] ❌ Tous les providers ont échoué.')
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

  const sanitizedFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]/gi, '-')
    .toLowerCase()

  const filePath = `ai-generated/${Date.now()}-${sanitizedFileName}.jpg`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, imageBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[ImageGen] Upload Supabase error:', error.message)
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
    console.error('[ImageGen] Cloudinary env vars missing')
    return null
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  try {
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', blob, `${fileName}.jpg`)
    formData.append('upload_preset', preset)
    formData.append('public_id', `ai_${Date.now()}_${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`)

    const res = await fetch(endpoint, { method: 'POST', body: formData })

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
 * Pipeline complet : prompt → image générée (Fal.ai FLUX.1 → Cloudflare) → URL (Cloudinary → Supabase)
 */
export async function generateAndUploadImage(
  imagePrompt: string,
  fileName: string = 'ai-image'
): Promise<string | null> {
  try {
    const imageBuffer = await generateImageFromPrompt(imagePrompt)
    if (!imageBuffer) return null

    // Upload Cloudinary d'abord, fallback Supabase
    let url = await uploadImageToCloudinary(imageBuffer, fileName)
    if (!url) {
      console.warn('[ImageGen] Cloudinary échoué, fallback Supabase...')
      url = await uploadImageToSupabase(imageBuffer, fileName)
    }
    return url
  } catch (err) {
    console.error('[ImageGen] Pipeline error:', err)
    return null
  }
}
