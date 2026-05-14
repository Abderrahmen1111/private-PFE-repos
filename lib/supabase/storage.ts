import { createClient } from './client'

const BUCKETS = {
  PRODUCTS: 'product-images',
  STORES: 'store-images',
  DOCUMENTS: 'store-documents',
  REVIEWS: 'review-images',
  AVATARS: 'avatars',
  STORIES: 'stories',
  REELS: 'reels',
} as const

const MAX_FILE_SIZES = {
  PRODUCTS: 5 * 1024 * 1024, // 5MB
  STORES: 5 * 1024 * 1024,
  DOCUMENTS: 10 * 1024 * 1024,
  REVIEWS: 5 * 1024 * 1024,
  AVATARS: 3 * 1024 * 1024,
  STORIES: 50 * 1024 * 1024, // 50MB for video stories
  REELS: 50 * 1024 * 1024,
} as const

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  path: string,
  file: File
) {
  const supabase = createClient()
  const bucketName = BUCKETS[bucket]
  
  // File size validation
  const maxSize = MAX_FILE_SIZES[bucket]
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { url: null, error: `Fichier trop volumineux. Maximum: ${maxSizeMB}MB` }
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      console.error(`Storage error for bucket ${bucketName}:`, error)
      // Provide more specific error messages
      if (error.message.includes('Bucket not found')) {
        return { url: null, error: `Le bucket de stockage ${bucketName} n'existe pas. Contactez le support.` }
      } else if (error.message.includes('AUTH')) {
        return { url: null, error: 'Erreur d\'authentification. Veuillez vous reconnecter.' }
      } else if (error.message.includes('NETWORK')) {
        return { url: null, error: 'Erreur réseau. Vérifiez votre connexion Internet.' }
      }
      return { url: null, error: error.message || 'Erreur lors de l\'upload' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    return { url: publicUrl, error: null }
  } catch (err: any) {
    console.error(`Unexpected error uploading to ${bucketName}:`, err)
    return { url: null, error: err.message || 'Erreur réseau lors de l\'upload' }
  }
}

export async function deleteFile(bucket: keyof typeof BUCKETS, path: string) {
  const supabase = createClient()
  return await supabase.storage.from(BUCKETS[bucket]).remove([path])
}

export function getPublicUrl(bucket: keyof typeof BUCKETS, path: string) {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKETS[bucket]).getPublicUrl(path)
  return data.publicUrl
}