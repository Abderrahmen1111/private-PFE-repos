'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Store = Database['public']['Tables']['stores']['Row']

export async function getStoreById(id: number) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching store:', error)
        return { error: error.message }
    }

    return { data: data as Store }
}

export async function getPrimaryStoreForOwner(userId: string): Promise<{ data?: any; error?: string }> {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from('stores')
        .select('id, name, logo_url')
        .eq('owner_id', userId)
        .limit(1)
        .maybeSingle()

    if (error) return { error: error.message }
    return { data }
}

export async function getUserStores(userId: string): Promise<{ data?: any[]; error?: string }> {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)

    if (error) {
        console.error('Error fetching user stores:', error)
        return { error: error.message }
    }

    return { data: data || [] }
}

export async function getStoreByBusinessId(businessId: number) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id_business', businessId)
        .maybeSingle()

    if (error) {
        console.error('Error fetching store by business ID:', error)
        return { error: error.message }
    }

    return { data: data as Store }
}

// Universal resolver for Dashboard to find store by any possible ID
export async function getStoreByAnyId(id: number) {
    const supabase = createClient() as any

    // 1. Try Primary ID
    const { data: byId } = await supabase.from('stores').select('*').eq('id', id).maybeSingle()
    if (byId) return { data: byId as Store }

    // 2. Try Business ID
    const { data: byBiz } = await supabase.from('stores').select('*').eq('id_business', id).maybeSingle()
    if (byBiz) return { data: byBiz as Store }

    // 3. Try Service ID
    const { data: byService } = await supabase.from('stores').select('*').eq('service_id', id).maybeSingle()
    if (byService) return { data: byService as Store }

    return { error: "Boutique introuvable" }
}

export async function updateStoreProfile(id: number, data: any) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('stores')
        .update({
            name: data.name,
            description: data.description,
            category: data.category?.toUpperCase() as any, // Match enum case
            phone: data.phone,
            address: data.address,
            logo_url: data.image, // Mapping image to logo_url for now
            opening_hours: data.workingHours,
            gallery: data.gallery || [],
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)

    if (error) {
        console.error('Error updating store:', error)
        return { error: error.message }
    }

    revalidatePath(`/dashboard/${id}/profile`)
    revalidatePath(`/merchants/business/${id}`)

    return { success: true }
}

export async function deleteStore(id: number) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()
    
    try {
        // 1. Get the store to find the owner and directory link
        const { data: store, error: fetchError } = await supabase
            .from('stores')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !store) {
            return { success: false, error: "Boutique introuvable." }
        }

        const storeData = store as any;

        // 2. Security Check: Only the owner can delete
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.id !== storeData.owner_id) {
            return { success: false, error: "Non autorisé." }
        }

        // 3. Sequential deletion using admin client to bypass RLS
        // Delete story views first (foreign key to stories)
        const { data: stories } = await (adminSupabase as any).from('stories').select('id').eq('store_id', id)
        if (stories && (stories as any[]).length > 0) {
            const storyIds = (stories as any[]).map(s => s.id)
            await (adminSupabase as any).from('story_views').delete().in('story_id', storyIds)
        }

        // Delete stories/reels
        await (adminSupabase as any).from('stories').delete().eq('store_id', id)

        // Delete service schedules first (foreign key to items)
        const { data: items } = await (adminSupabase as any).from('items').select('id').eq('store_id', id)
        if (items && (items as any[]).length > 0) {
            const itemIds = (items as any[]).map(i => i.id)
            await (adminSupabase as any).from('service_schedules').delete().in('item_id', itemIds)
        }

        // Delete items (products/services)
        await (adminSupabase as any).from('items').delete().eq('store_id', id)

        // Delete reviews
        await (adminSupabase as any).from('reviews').delete().eq('store_id', id)

        // Delete bookings
        await (adminSupabase as any).from('bookings').delete().eq('store_id', id)

        // Delete orders
        await (adminSupabase as any).from('orders').delete().eq('store_id', id)

        // Delete promotions
        await (adminSupabase as any).from('promotions').delete().eq('store_id', id)

        // 4. Handle business directory unclaiming
        const directoryId = storeData.business_directory_id || storeData.id_business;
        if (directoryId) {
            await (adminSupabase as any)
                .from('business_directory_tunisia')
                .update({ 
                    is_claimed: false, 
                    claimed_by: null,
                    store_id: null 
                })
                .eq('id', directoryId)
        }

        // 5. Delete the store record itself
        const { error: deleteError } = await (adminSupabase as any)
            .from('stores')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        // 6. Revert user role to CLIENT
        const { error: roleError } = await (adminSupabase as any)
            .from('users')
            .update({ role: 'CLIENT' })
            .eq('id', user.id);

        if (roleError) {
            console.error("CRITICAL: Error reverting role to CLIENT:", roleError);
        } else {
            console.log(`Successfully downgraded user ${user.id} to CLIENT`);
        }

        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath('/profile')

        return { success: true }
    } catch (err: any) {
        console.error('Error during full store deletion:', err)
        return { error: err.message || 'Une erreur est survenue lors de la suppression.' }
    }
}
