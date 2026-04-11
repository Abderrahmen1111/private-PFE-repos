'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ReelComment {
  id: number
  reel_id: number
  user_id: string
  content: string | null
  attachment_url: string | null
  attachment_type: 'image' | 'sticker' | null
  created_at: string
  user?: {
    full_name: string
    avatar_url: string | null
  }
}

// Fetch all comments for a specific reel
export async function getReelComments(reelId: number): Promise<ReelComment[]> {
  const supabase = createClient()

  const { data, error } = await (supabase as any)
    .from('reel_comments')
    .select(`
      *,
      user:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('reel_id', reelId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching reel comments:', error)
    return []
  }

  return data || []
}

// Post a new comment
export async function postReelComment(input: {
  reelId: number
  content?: string
  attachmentUrl?: string
  attachmentType?: 'image' | 'sticker'
}) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Non authentifié.' }

  if (!input.content && !input.attachmentUrl) {
    return { success: false, error: 'Le commentaire ne peut pas être vide.' }
  }

  const { data, error } = await (supabase as any)
    .from('reel_comments')
    .insert({
      reel_id: input.reelId,
      user_id: user.id,
      content: input.content || null,
      attachment_url: input.attachmentUrl || null,
      attachment_type: input.attachmentType || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error posting comment:', error)
    return { success: false, error: error.message }
  }

  return { success: true, comment: data }
}

// Delete a comment
export async function deleteReelComment(commentId: number) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Non authentifié.' }

  const { error } = await (supabase as any)
    .from('reel_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // Security check

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Upload comment attachment (image/sticker)
export async function uploadCommentAttachment(formData: FormData): Promise<string | null> {
    const file = formData.get('file') as File | null;
    if (!file) return null;

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `comment-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
        .from('reels') // Reuse reels bucket
        .upload(filename, file, { contentType: file.type, upsert: false })

    if (error) {
        console.error('Upload error:', error)
        return null
    }

    const { data } = supabase.storage.from('reels').getPublicUrl(filename)
    return data?.publicUrl || null
}
