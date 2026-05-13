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
    const adminSupabase: any = createAdminClient()
    
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
        
        // --- STORIES ---
        const { data: stories } = await (adminSupabase as any).from('stories').select('id').eq('store_id', id)
        if (stories && (stories as any[]).length > 0) {
            const storyIds = (stories as any[]).map(s => s.id)
            await (adminSupabase as any).from('story_views').delete().in('story_id', storyIds)
        }
        await (adminSupabase as any).from('stories').delete().eq('store_id', id)

        // --- REELS ---
        const { data: reels } = await (adminSupabase as any).from('reels').select('id').eq('store_id', id)
        if (reels && (reels as any[]).length > 0) {
            const reelIds = (reels as any[]).map(r => r.id)
            await (adminSupabase as any).from('reel_stats').delete().in('reel_id', reelIds)
            await (adminSupabase as any).from('reel_comments').delete().in('reel_id', reelIds)
            await (adminSupabase as any).from('reel_sponsorships').delete().in('reel_id', reelIds)
        }
        await (adminSupabase as any).from('reels').delete().eq('store_id', id)

        // --- ITEMS & PROMOTIONS ---
        const { data: items } = await (adminSupabase as any).from('items').select('id').eq('store_id', id)
        if (items && (items as any[]).length > 0) {
            const itemIds = (items as any[]).map(i => i.id)
            await (adminSupabase as any).from('service_schedules').delete().in('item_id', itemIds)
            await (adminSupabase as any).from('promotion_items').delete().in('item_id', itemIds)
        }
        await (adminSupabase as any).from('promotions').delete().eq('store_id', id)
        await (adminSupabase as any).from('items').delete().eq('store_id', id)

        // --- OTHER ASSETS & DATA ---
        await (adminSupabase as any).from('banners').delete().eq('store_id', id)
        await (adminSupabase as any).from('ad_campaigns').delete().eq('store_id', id)
        await (adminSupabase as any).from('messages').delete().eq('store_id', id)
        await (adminSupabase as any).from('saved_places').delete().eq('store_id', id)
        await (adminSupabase as any).from('sponsored_campaigns').delete().eq('store_id', id)
        await (adminSupabase as any).from('store_analytics').delete().eq('store_id', id)

        // --- FINANCE & FRAUD (Must be deleted before bookings/orders) ---
        await (adminSupabase as any).from('transactions').delete().eq('merchant_id', id)
        
        // Delete fraud checks linked to the store's bookings/orders
        const { data: storeBookings } = await (adminSupabase as any).from('bookings').select('id').eq('store_id', id)
        if (storeBookings && (storeBookings as any[]).length > 0) {
            const bIds = (storeBookings as any[]).map(b => b.id)
            await (adminSupabase as any).from('booking_fraud_checks').delete().in('booking_id', bIds)
        }
        
        const { data: storeOrders } = await (adminSupabase as any).from('orders').select('id').eq('store_id', id)
        if (storeOrders && (storeOrders as any[]).length > 0) {
            const oIds = (storeOrders as any[]).map(o => o.id)
            await (adminSupabase as any).from('order_fraud_checks').delete().in('order_id', oIds)
        }

        // --- REVIEWS, BOOKINGS & ORDERS ---
        await (adminSupabase as any).from('reviews').delete().eq('store_id', id)
        await (adminSupabase as any).from('bookings').delete().eq('store_id', id)
        await (adminSupabase as any).from('orders').delete().eq('store_id', id)

        // --- SUPPORT TICKETS & MESSAGES ---
        const { data: tickets } = await (adminSupabase as any).from('support_tickets').select('id').eq('store_id', id)
        if (tickets && (tickets as any[]).length > 0) {
            const ticketIds = (tickets as any[]).map(t => t.id)
            await (adminSupabase as any).from('support_messages').delete().in('ticket_id', ticketIds)
        }
        await (adminSupabase as any).from('support_tickets').delete().eq('store_id', id)

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

        // 6. Conditional Role Revert: Only if no other stores remain
        const { count: remainingStores, error: countError } = await (adminSupabase as any)
            .from('stores')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id);

        if (!countError && (remainingStores === 0)) {
            const { error: roleError } = await (adminSupabase as any)
                .from('users')
                .update({ role: 'CLIENT' })
                .eq('id', user.id);

            if (roleError) {
                console.error("CRITICAL: Error reverting role to CLIENT:", roleError);
            } else {
                console.log(`Successfully downgraded user ${user.id} to CLIENT (no stores remaining)`);
            }
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

/**
 * Transfers store ownership to another Ro2ya user identified by their account email.
 * Current user must own the store. Updates `stores.owner_id` (and store `email` when set).
 */
export async function transferStoreOwnership(
    storeId: number,
    newOwnerEmailRaw: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const adminSupabase: any = createAdminClient()

    const newOwnerEmail = newOwnerEmailRaw.trim().toLowerCase()
    if (!newOwnerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOwnerEmail)) {
        return { success: false, error: 'Adresse e-mail invalide.' }
    }

    try {
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser()
        if (!currentUser) {
            return { success: false, error: 'Non authentifié.' }
        }

        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, owner_id, email')
            .eq('id', storeId)
            .single()

        if (storeError || !store) {
            return { success: false, error: 'Boutique introuvable.' }
        }

        const storeRow = store as { id: number; owner_id: string; email: string | null }
        if (storeRow.owner_id !== currentUser.id) {
            return { success: false, error: 'Non autorisé.' }
        }

        const { data: currentRow } = await supabase
            .from('users')
            .select('email')
            .eq('id', currentUser.id)
            .maybeSingle()

        const currentEmail = ((currentRow as { email?: string | null } | null)?.email || currentUser.email || '')
            .trim()
            .toLowerCase()
        if (currentEmail && currentEmail === newOwnerEmail) {
            return { success: false, error: 'Vous ne pouvez pas transférer la boutique à votre propre adresse.' }
        }

        const { data: newOwnerRows, error: userLookupError } = await adminSupabase
            .from('users')
            .select('id, email, role')
            .ilike('email', newOwnerEmail)

        if (userLookupError) {
            return { success: false, error: userLookupError.message }
        }

        const list = (newOwnerRows || []) as { id: string; email: string | null; role: string }[]
        const newOwner =
            list.find((u) => (u.email || '').trim().toLowerCase() === newOwnerEmail) || list[0]

        if (!newOwner) {
            return {
                success: false,
                error: 'Aucun compte Ro2ya trouvé avec cet e-mail. Le nouveau propriétaire doit déjà posséder un compte.',
            }
        }

        if (newOwner.id === currentUser.id) {
            return { success: false, error: 'Destinataire invalide.' }
        }

        const { error: updateStoreError } = await adminSupabase
            .from('stores')
            .update({
                owner_id: newOwner.id,
                email: newOwner.email ?? newOwnerEmail,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', storeId)

        if (updateStoreError) {
            console.error('transferStoreOwnership update store:', updateStoreError)
            return { success: false, error: updateStoreError.message }
        }

        const roleUpper = (newOwner.role || 'CLIENT').toString().toUpperCase()
        if (roleUpper === 'CLIENT') {
            const { error: roleUpError } = await adminSupabase
                .from('users')
                .update({ role: 'PRO' as any })
                .eq('id', newOwner.id)
            if (roleUpError) {
                console.error('transferStoreOwnership role upgrade:', roleUpError)
            }
        }

        const { count: oldOwnerRemaining, error: countError } = await adminSupabase
            .from('stores')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', currentUser.id)

        if (!countError && (oldOwnerRemaining === 0 || oldOwnerRemaining === null)) {
            const { error: roleDownError } = await adminSupabase
                .from('users')
                .update({ role: 'CLIENT' as any })
                .eq('id', currentUser.id)
            if (roleDownError) {
                console.error('transferStoreOwnership role downgrade:', roleDownError)
            }
        }

        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath('/profile')

        return { success: true }
    } catch (err: any) {
        console.error('transferStoreOwnership:', err)
        return { success: false, error: err.message || 'Une erreur est survenue lors du transfert.' }
    }
}

export async function updateStoreStatus(storeId: number, status: 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'SUSPENDED') {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    try {
        // 1. Get the store to find the owner
        const { data: store, error: fetchError } = await supabase
            .from('stores')
            .select('owner_id')
            .eq('id', storeId)
            .single()

        if (fetchError || !store) {
            return { success: false, error: "Boutique introuvable." }
        }

        // 2. Update store status
        const { error: updateError } = await (adminSupabase as any)
            .from('stores')
            .update({ status })
            .eq('id', storeId)

        if (updateError) throw updateError

        // 3. If REJECTED, revert user role to CLIENT
        if (status === 'REJECTED') {
            const { error: roleError } = await (adminSupabase as any)
                .from('users')
                .update({ role: 'CLIENT' })
                .eq('id', store.owner_id)

            if (roleError) {
                console.error("Error reverting role to CLIENT:", roleError)
            }
        }

        revalidatePath('/')
        revalidatePath('/dashboard')
        revalidatePath('/profile')

        return { success: true }
    } catch (err: any) {
        console.error('Error updating store status:', err)
        return { error: err.message || 'Une erreur est survenue.' }
    }
}
