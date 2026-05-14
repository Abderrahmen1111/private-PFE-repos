'use server'

import { createClient } from '@/lib/supabase/server'

// Fetch all active client stories for a given business store
export async function getBusinessStories(storeId: number) {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('stories')
        .select(`
            id,
            media_url,
            media_type,
            caption,
            views_count,
            created_at,
            author_id,
            is_approved,
            expires_at,
            author:users (
                full_name,
                avatar_url
            ),
            stores:stores (
                name,
                logo_url,
                owner_id
            )
        `)
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching stories:', error)
        return []
    }
    return data || []
}

// Fetch all active stories for Global Discover Feed
export async function getDiscoverStories(limit: number = 20) {
    const supabase = createClient()

    const { data, error } = await (supabase as any)
        .from('stories')
        .select(`
            id,
            media_url,
            media_type,
            caption,
            views_count,
            created_at,
            store_id,
            author:users (
                full_name,
                avatar_url
            ),
            stores:stores (
                name,
                logo_url,
                owner_id
            )
        `)
        .eq('is_approved', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching discover stories:', error)
        return []
    }
    return data || []
}

// Publish a new story (client posting about a business)
export async function publishStory(input: {
    storeId: number
    mediaUrl: string
    mediaType: 'image' | 'video'
    caption?: string
}) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Non authentifié.' }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { data, error } = await (supabase as any)
        .from('stories')
        .insert({
            store_id: input.storeId,
            author_id: user.id,
            media_url: input.mediaUrl,
            media_type: input.mediaType,
            caption: input.caption || null,
            expires_at: expiresAt.toISOString(),
            is_approved: true,
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error publishing story:', error)
        return { success: false, error: error.message }
    }
    return { success: true, storyId: data.id }
}

// Record a view (once per user per story)
export async function recordStoryView(storyId: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await (supabase as any)
        .from('story_views')
        .upsert({ story_id: storyId, viewer_id: user.id }, { onConflict: 'story_id,viewer_id' })
}

// Upload a story media file to storage and return the public URL
// Publier une Story avec Upload Cloudinary intégré
export async function uploadAndPublishStory(formData: FormData) {
    const file = formData.get('file') as File | null;
    const storeId = Number(formData.get('storeId'));
    const caption = formData.get('caption') as string;

    if (!file) return { success: false, error: "Fichier manquant" };
    if (!storeId) return { success: false, error: "Store ID manquant" };

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return { success: false, error: "Cloudinary non configuré" };

    const isVideo = file.type.startsWith('video/');
    const uploadEndpoint = isVideo
        ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
        : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'ro2ya_reels'); // on peut réutiliser le preset ou en créer un autre

    try {
        const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: cloudinaryFormData,
        });

        if (!response.ok) {
            console.error('Cloudinary error:', await response.text());
            return { success: false, error: "Échec de l'upload Cloudinary" };
        }

        const data = await response.json();
        const mediaUrl = data.secure_url;

        // Save to Supabase
        return await publishStory({
            storeId,
            mediaUrl,
            mediaType: isVideo ? 'video' : 'image',
            caption
        });

    } catch (error: any) {
        console.error('Error in uploadAndPublishStory:', error);
        return { success: false, error: error.message || "Erreur serveur" };
    }
}

export async function uploadStoryMedia(formData: FormData): Promise<{ url: string | null; error: string | null }> {
    const file = formData.get('file') as File | null;
    if (!file) return { url: null, error: 'Fichier manquant' };

    // File size validation (50MB max for stories with video)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        return { url: null, error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 50MB` };
    }

    // File type validation
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const isAllowedType = [...allowedImageTypes, ...allowedVideoTypes].includes(file.type);
    
    if (!isAllowedType) {
        return { url: null, error: `Type de fichier non supporté: ${file.type}. Utilisez JPG, PNG, GIF, WebP pour les images ou MP4 pour les vidéos.` };
    }

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    try {
        const { uploadFile } = await import('@/lib/supabase/storage')
        const { url, error } = await uploadFile('STORIES', filename, file)

        if (error) {
            console.error('Upload error:', error)
            return { url: null, error: error }
        }

        return { url: url || null, error: null }
    } catch (err: any) {
        console.error('Error uploading story media:', err)
        return { url: null, error: err.message || 'Erreur lors de l\'upload du fichier' }
    }
}

// Delete a story (only owner)
export async function deleteStory(storyId: number) {
    const supabase = createClient()
    const { error } = await (supabase as any)
        .from('stories')
        .delete()
        .eq('id', storyId)

    if (error) return { success: false }
    return { success: true }
}

export async function getDashboardStories(storeId: number) {
    const supabase = createClient()
    
    // Fetch stories for this store, including expired ones for dashboard management
    const { data, error } = await (supabase as any)
        .from('stories')
        .select(`
            *,
            author:author_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching dashboard stories:', error);
        return [];
    }

    return data || [];
}

// Fetch stories from all followed stores for the current user
export async function getFollowedStoresStories(limit: number = 50) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) return []

    // First get the list of followed stores
    const { data: followedData, error: followError } = await (supabase as any)
        .from('store_follows')
        .select('store_id')
        .eq('user_id', user.id)

    if (followError || !followedData || followedData.length === 0) {
        return []
    }

    const storeIds = followedData.map((f: any) => f.store_id)

    // Then fetch stories from those stores
    const { data, error } = await (supabase as any)
        .from('stories')
        .select(`
            id,
            media_url,
            media_type,
            caption,
            views_count,
            created_at,
            author_id,
            store_id,
            is_approved,
            expires_at,
            author:users (
                full_name,
                avatar_url
            ),
            stores:stores (
                id,
                name,
                logo_url,
                owner_id
            )
        `)
        .in('store_id', storeIds)
        .eq('is_approved', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching followed stores stories:', error)
        return []
    }
    return data || []
}
