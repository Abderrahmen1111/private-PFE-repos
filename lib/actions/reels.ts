'use server'

import { createClient } from '@/lib/supabase/server'

export interface ReelInput {
    storeId: number
    mediaPath: string | string[]
    mediaType: 'image' | 'video'
    title: string
    subtitle?: string
    price?: number
    currency?: string
    ctaType?: 'call' | 'whatsapp' | 'view'
    ctaValue?: string
    category?: string
    itemId?: number
}

// Helper to parse media_url (handles single string or JSON array)
function parseMediaUrls(url: string): string[] {
    if (!url) return [];
    if (url.startsWith('[') && url.endsWith(']')) {
        try {
            return JSON.parse(url);
        } catch (e) {
            return [url];
        }
    }
    return [url];
}

// Fetch all reels for a given business store
export async function getBusinessReels(storeId: number) {
    const supabase = createClient()

    // 1. Fetch reels and base stats
    const { data: reelsData, error: reelsError } = await (supabase as any)
        .from('reels')
        .select(`
            *,
            reel_stats (*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (reelsError) {
        console.error('Error fetching reels:', reelsError)
        return []
    }
    
    const reelIds = reelsData.map((r: any) => r.id);

    // 2. Fetch interaction counts
    const [interactionsResult, commentsResult] = await Promise.all([
        (supabase as any).from('user_interactions').select('reel_id, type').in('reel_id', reelIds),
        (supabase as any).from('reel_comments').select('reel_id').in('reel_id', reelIds)
    ]);

    const interactionsData = interactionsResult.data;
    const commentsData = commentsResult.data;

    if (interactionsResult.error) console.error('Error fetching interactions:', interactionsResult.error);
    if (commentsResult.error) console.error('Error fetching comments:', commentsResult.error);

    // Identify reels missing stats and initialize them
    const missingStats = reelsData.filter((reel: any) => !reel.reel_stats)
    if (missingStats.length > 0) {
        await Promise.all(missingStats.map((reel: any) => 
            (supabase as any).from('reel_stats').insert({ reel_id: reel.id })
        ))
    }
    
    // Flatten stats and parse media URLs for easier UI consumption
    return reelsData.map((reel: any) => {
        const reelInteractions = interactionsData?.filter((i: any) => i.reel_id === reel.id) || [];
        
        return {
            ...reel,
            media_urls: parseMediaUrls(reel.media_path),
            is_gallery: parseMediaUrls(reel.media_path).length > 1,
            stats: {
                ...(reel.reel_stats || {}),
                views_count: reel.reel_stats?.views_count || 0,
                likes_count: reelInteractions.filter((i: any) => i.type === 'like').length,
                clicks_count: reel.reel_stats?.clicks_count || 0,
                contact_count: reel.reel_stats?.contact_count || 0,
                comments_count: (commentsData?.filter((c: any) => c.reel_id === reel.id) || []).length,
            }
        };
    });
}

// Track a user interaction with a reel
export async function trackReelInteraction(reelId: number, type: 'like' | 'save' | 'completion' | 'view') {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Non authentifié.' }

    // Check if interaction already exists for like/save (not for completion which can be multiple)
    if (type === 'like' || type === 'save') {
        const { data: existing } = await (supabase as any)
            .from('user_interactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('reel_id', reelId)
            .eq('type', type)
            .maybeSingle();
            
        if (existing) {
            // Un-like or Un-save
            await (supabase as any).from('user_interactions').delete().eq('id', existing.id);
            return { success: true, action: 'removed' };
        }
    }

    const { error } = await (supabase as any)
        .from('user_interactions')
        .insert({
            user_id: user.id,
            reel_id: reelId,
            type: type
        });

    if (error) {
        console.error('Error tracking interaction:', error);
        return { success: false, error: error.message };
    }

    return { success: true, action: 'added' };
}

/**
 * Record visit to a business page.
 * Uses store_analytics table for better tracking.
 */
export async function recordStoreView(storeId: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // We use store_analytics for business page views
    await (supabase as any)
        .from('store_analytics')
        .insert({
            user_id: user?.id || null,
            store_id: storeId,
            session_id: crypto.randomUUID(), 
            type: 'view'
        });
}

// Publish a new reel
export async function publishReel(input: ReelInput) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Non authentifié.' }

    const finalMediaPath = Array.isArray(input.mediaPath) 
        ? JSON.stringify(input.mediaPath) 
        : input.mediaPath;

    const { data, error } = await (supabase as any)
        .from('reels')
        .insert({
            store_id: input.storeId,
            media_path: finalMediaPath,
            media_type: input.mediaType,
            title: input.title,
            subtitle: input.subtitle || null,
            price: input.price || null,
            currency: input.currency || 'TND',
            cta_type: input.ctaType || 'view',
            cta_value: input.ctaValue || null,
            category: input.category || null,
            item_id: input.itemId || null,
            status: 'active'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error publishing reel:', error)
        return { success: false, error: error.message }
    }

    // Initialize stats for the new reel
    await (supabase as any).from('reel_stats').insert({ reel_id: data.id })

    return { success: true, reelId: data.id }
}

// Upload a reel media file to storage
export async function uploadReelMedia(formData: FormData): Promise<string | null> {
    const file = formData.get('file') as File | null;
    if (!file) return null;

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Use 'reels' bucket if exists, otherwise fallback to 'stories'
    const bucket = 'reels'
    
    const { error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { contentType: file.type, upsert: false })

    if (error) {
        console.error('Upload error (reels bucket):', error)
        
        // If it's an RLS error (403), don't fallback to stories bucket
        if ((error as any).statusCode === '403' || (error as any).status === 403) {
            console.error('RLS policy violation: please ensure your account has upload permissions for the "reels" bucket.')
            return null
        }

        // Only fallback to 'stories' bucket if 'reels' doesn't exist (e.g. 404)
        const { error: fallbackError } = await supabase.storage
            .from('stories')
            .upload(filename, file, { contentType: file.type, upsert: false })
            
        if (fallbackError) {
            console.error('Upload error (stories bucket):', fallbackError)
            return null
        }
        const { data } = supabase.storage.from('stories').getPublicUrl(filename)
        return data?.publicUrl || null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
    return data?.publicUrl || null
}

// Delete a reel
export async function deleteReel(reelId: number) {
    const supabase = createClient()
    
    // Stats will be deleted by cascade since they have a foreign key to reels
    const { error } = await (supabase as any)
        .from('reels')
        .delete()
        .eq('id', reelId)

    if (error) {
        console.error('Error deleting reel:', error)
        return { success: false }
    }
    return { success: true }
}
