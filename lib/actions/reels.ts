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
    metadata?: any
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
    const missingStats = reelsData.filter((reel: any) => {
        const stats = Array.isArray(reel.reel_stats) ? reel.reel_stats[0] : reel.reel_stats;
        return !stats;
    })
    
    if (missingStats.length > 0) {
        await Promise.all(missingStats.map((reel: any) => 
            (supabase as any).from('reel_stats').insert({ reel_id: reel.id })
        ))
    }
    
    // Flatten stats and parse media URLs for easier UI consumption
    return reelsData.map((reel: any) => {
        const reelInteractions = interactionsData?.filter((i: any) => i.reel_id === reel.id) || [];
        const rawStats = Array.isArray(reel.reel_stats) ? reel.reel_stats[0] : reel.reel_stats;
        const statsObj = rawStats || {};
        const dbStats = reel.stats || {}; // Handle potential JSONB stats column
        
        return {
            ...reel,
            media_urls: parseMediaUrls(reel.media_path),
            is_gallery: parseMediaUrls(reel.media_path).length > 1,
            stats: {
                ...dbStats,
                ...statsObj,
                views_count: statsObj.views_count || statsObj.view_count || reel.views_count || reel.view_count || dbStats.views_count || dbStats.view_count || 0,
                likes_count: reelInteractions.filter((i: any) => i.type === 'like').length || dbStats.likes_count || 0,
                clicks_count: statsObj.clicks_count || reel.clicks_count || dbStats.clicks_count || 0,
                contact_count: statsObj.contact_count || reel.contact_count || dbStats.contact_count || 0,
                comments_count: (commentsData?.filter((c: any) => c.reel_id === reel.id) || []).length || dbStats.comments_count || 0,
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

    // --- MISE À JOUR RÉELLE DES COMPTEURS ---
    if (type === 'view') {
        await (supabase as any).rpc('increment_reel_view', { x: 1, reel_id_input: reelId });
    } else if (type === 'like') {
        await (supabase as any).rpc('increment_reel_like', { x: 1, reel_id_input: reelId });
    } else if (type === 'save') {
        await (supabase as any).rpc('increment_reel_save', { x: 1, reel_id_input: reelId });
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
            metadata: input.metadata || null,
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
// ============================================
// ONLY MODIFY THIS FUNCTION - REST OF FILE STAYS THE SAME
// ============================================

// Upload a reel media file to Cloudinary
export async function uploadReelMedia(formData: FormData): Promise<string | null> {
    const file = formData.get('file') as File | null;
    if (!file) return null;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.error('Cloudinary cloud name is missing. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local');
        return null;
    }

    // Determine endpoint based on file type
    const isVideo = file.type.startsWith('video/');
    const uploadEndpoint = isVideo
        ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
        : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'ro2ya_reels');

    try {
        const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: cloudinaryFormData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary upload error:', errorData);
            return null;
        }

        const data = await response.json();
        return data.secure_url;
        
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
}


// Delete a reel (also removes file from Cloudinary)
export async function deleteReel(reelId: number) {
    const supabase = createClient()
    
    // First, get the reel to find the Cloudinary public ID
    const { data: reel, error: fetchError } = await (supabase as any)
        .from('reels')
        .select('media_path')
        .eq('id', reelId)
        .single()
    
    if (fetchError) {
        console.error('Error fetching reel:', fetchError)
        return { success: false }
    }
    
    // Delete from Cloudinary if it's a Cloudinary URL
    const mediaPath = reel.media_path
    
    if (mediaPath && typeof mediaPath === 'string' && mediaPath.includes('res.cloudinary.com')) {
        try {
            // Extract public ID from Cloudinary URL
            // URL format examples:
            // https://res.cloudinary.com/cloud/video/upload/v123456/folder/filename.mp4
            // https://res.cloudinary.com/cloud/image/upload/v123456/folder/image.jpg
            
            let publicId = mediaPath.split('/upload/')[1]
            
            // Remove video/image prefix and version if present
            if (publicId) {
                // Remove transformation parameters if any (e.g., f_auto,q_auto)
                if (publicId.includes('/')) {
                    const parts = publicId.split('/')
                    // Check if first part is transformation (contains letters and underscores)
                    if (parts[0].includes('_') && !parts[0].includes('v')) {
                        parts.shift() // Remove transformation
                    }
                    publicId = parts.join('/')
                }
                
                // Remove file extension
                publicId = publicId.replace(/\.[^/.]+$/, '')
                
                // Get cloud name from URL
                const cloudNameMatch = mediaPath.match(/res\.cloudinary\.com\/([^/]+)/)
                const cloudName = cloudNameMatch ? cloudNameMatch[1] : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                
                // Call your API route to delete from Cloudinary
                const deleteResponse = await fetch('/api/cloudinary/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        publicId: publicId,
                        resourceType: mediaPath.includes('/image/') ? 'image' : 'video'
                    }),
                })
                
                if (!deleteResponse.ok) {
                    console.error('Failed to delete from Cloudinary:', await deleteResponse.text())
                    // Continue with database deletion even if Cloudinary delete fails
                }
            }
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error)
            // Continue with database deletion
        }
    }
    
    // Delete from database (stats will be deleted by cascade)
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
