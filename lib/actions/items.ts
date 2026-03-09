'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']

/**
 * Fetches items for a specific store ONLY if the store is ACTIVE (verified).
 * Used for public-facing pages.
 */
export async function getPublicItemsByStoreId(storeId: number): Promise<Item[]> {
    const supabase = createClient()

    // Fetch items that are AVAILABLE
    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: false })

    if (itemsError) {
        console.error('Error fetching public items:', itemsError)
        return []
    }

    return items as Item[]
}

/**
 * Fetches all items for a specific store, regardless of store status.
 * Used for dashboard/owner view.
 */
export async function getAdminItemsByStoreId(storeId: number): Promise<Item[]> {
    const supabase = createClient()

    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (itemsError) {
        console.error('Error fetching admin items:', itemsError)
        return []
    }

    return items as Item[]
}

/**
 * Creates or updates an item.
 */
export async function upsertItem(item: Partial<Item> & { store_id: number }) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('items')
        .upsert({
            ...item,
            updated_at: new Date().toISOString()
        } as any)
        .select()
        .single()

    if (error) {
        console.error('Error upserting item:', error)
        return { error: error.message }
    }

    revalidatePath(`/business/${item.store_id}`)
    revalidatePath(`/dashboard/${item.store_id}/products`)

    return { data: data as Item }
}

/**
 * Deletes an item.
 */
export async function deleteItem(itemId: number, storeId: number) {
    const supabase = createClient()

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

    if (error) {
        console.error('Error deleting item:', error)
        return { error: error.message }
    }

    revalidatePath(`/business/${storeId}`)
    revalidatePath(`/dashboard/${storeId}/products`)

    return { success: true }
}
