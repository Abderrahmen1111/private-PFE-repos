'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPromotions(storeId: number) {
    const supabase = createClient()
    const { data, error } = await (supabase as any)
        .from('promotions')
        .select(`
            *,
            promotion_items (
                item_id
            )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching promotions:', error)
        return []
    }

    // Map to include item_ids array for the UI
    return (data || []).map((p: any) => ({
        ...p,
        item_ids: p.promotion_items?.map((pi: any) => pi.item_id) || []
    }))
}

export async function createPromotion(storeId: number, promo: {
    title: string
    description?: string
    discount_percent?: number
    discount_text?: string
    valid_from: string
    valid_until: string
    apply_to_all: boolean
    item_ids?: number[]
}) {
    const supabase = createClient()

    // 1. Insert promotion record
    const { data: promotion, error: promoError } = await (supabase as any)
        .from('promotions')
        .insert({
            store_id: storeId,
            title: promo.title,
            description: promo.description,
            discount_percent: promo.discount_percent,
            discount_text: promo.discount_text,
            valid_from: promo.valid_from,
            valid_until: promo.valid_until,
            apply_to_all: promo.apply_to_all,
            active: true
        })
        .select()
        .single()

    if (promoError) {
        console.error('Error creating promotion:', promoError)
        return { success: false, error: promoError.message }
    }

    // 2. If not apply_to_all, insert links
    if (!promo.apply_to_all && promo.item_ids && promo.item_ids.length > 0) {
        const links = promo.item_ids.map(itemId => ({
            promotion_id: (promotion as any).id,
            item_id: itemId
        }))
        const { error: linkError } = await (supabase as any)
            .from('promotion_items')
            .insert(links)

        if (linkError) {
            console.error('Error linking items:', linkError)
            // Optional: Should we delete the promo if linking fails? 
            // For now just log it.
        }
    }

    revalidatePath(`/dashboard/${storeId}/promotions`)
    revalidatePath(`/business/${storeId}`)
    return { success: true, data: promotion }
}

export async function updatePromotion(promoId: number, storeId: number, updates: {
    title?: string
    description?: string
    discount_percent?: number
    discount_text?: string
    valid_from?: string
    valid_until?: string
    apply_to_all?: boolean
    item_ids?: number[]
}) {
    const supabase = createClient()

    // 1. Update basic info
    const { error: updateError } = await (supabase as any)
        .from('promotions')
        .update({
            title: updates.title,
            description: updates.description,
            discount_percent: updates.discount_percent,
            discount_text: updates.discount_text,
            valid_from: updates.valid_from,
            valid_until: updates.valid_until,
            apply_to_all: updates.apply_to_all
        })
        .eq('id', promoId)

    if (updateError) {
        console.error('Error updating promotion:', updateError)
        return { success: false }
    }

    // 2. Sync items if provided
    if (updates.item_ids !== undefined) {
        // Delete existing links
        await (supabase as any)
            .from('promotion_items')
            .delete()
            .eq('promotion_id', promoId)

        // Insert new ones if not apply_to_all
        if (!updates.apply_to_all && updates.item_ids.length > 0) {
            const links = updates.item_ids.map(itemId => ({
                promotion_id: promoId,
                item_id: itemId
            }))
            await (supabase as any)
                .from('promotion_items')
                .insert(links)
        }
    }

    revalidatePath(`/dashboard/${storeId}/promotions`)
    revalidatePath(`/business/${storeId}`)
    return { success: true }
}

export async function deletePromotion(promoId: number, storeId: number) {
    const supabase = createClient()
    const { error } = await (supabase as any)
        .from('promotions')
        .delete()
        .eq('id', promoId)

    if (error) {
        console.error('Error deleting promotion:', error)
        return { success: false }
    }

    revalidatePath(`/dashboard/${storeId}/promotions`)
    revalidatePath(`/business/${storeId}`)
    return { success: true }
}

export async function togglePromotion(promoId: number, storeId: number, active: boolean) {
    const supabase = createClient()
    const { error } = await (supabase as any)
        .from('promotions')
        .update({ active })
        .eq('id', promoId)

    if (error) {
        console.error('Error toggling promotion:', error)
        return { success: false }
    }

    revalidatePath(`/dashboard/${storeId}/promotions`)
    revalidatePath(`/business/${storeId}`)
    return { success: true }
}
