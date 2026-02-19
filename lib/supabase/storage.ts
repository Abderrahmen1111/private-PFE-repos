import { createClient } from './client'

const BUCKETS = {
  PRODUCTS: 'product-images',
  STORES: 'store-images',
  DOCUMENTS: 'store-documents',
  REVIEWS: 'review-images',
  AVATARS: 'avatars',
} as const

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  path: string,
  file: File
) {
  const supabase = createClient()
  const bucketName = BUCKETS[bucket]

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path)

  return { url: publicUrl, error: null }
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