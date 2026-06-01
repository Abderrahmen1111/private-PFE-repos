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

import { generateEmbedding } from '@/lib/openrouter-embeddings'

/**
 * Creates or updates an item.
 */
export async function upsertItem(item: Partial<Item> & { store_id: number }) {
    const supabase = createClient()

    // Generate embedding automatically before saving
    let embedding: number[] | null = null;
    try {
        const textToEmbed = `${item.name || ''} ${item.description || ''}`.trim();
        if (textToEmbed.length > 2) {
            embedding = await generateEmbedding(textToEmbed);
        }
    } catch (e) {
        console.error('Failed to generate embedding for item:', e);
    }

    // Normalize stock: services must have null stock_quantity (check_stock_by_type constraint)
    const normalizedItem = {
        ...item,
        stock_quantity: item.item_type === 'SERVICE' ? null : item.stock_quantity,
    };

    const { data, error } = await supabase
        .from('items')
        .upsert({
            ...normalizedItem,
            embedding,
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
export async function deleteItem(itemId: number, store_id: number) {
    const supabase = createClient()

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

    if (error) {
        console.error('Error deleting item:', error)
        return { error: error.message }
    }

    revalidatePath(`/business/${store_id}`)
    revalidatePath(`/dashboard/${store_id}/products`)

    return { success: true }
}

/**
 * Fetches the most recent items (Products/Services) for discovery.
 */
export async function getLatestItems(limit: number = 10) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('items')
        .select(`
            *,
            stores!inner (
                name,
                logo_url,
                status,
                owner_id
            )
        `)
        .eq('stores.status', 'PUBLISHED')
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching latest items:', error)
        return []
    }

    return data || []
}

/**
 * Decrements the stock of an item.
 */
export async function decrementStock(itemId: number, quantity: number) {
    const supabase = createClient()
    
    const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('stock_quantity, item_type, store_id')
        .eq('id', itemId)
        .single()
        
    if (fetchError || !item) return { error: 'Item not found' }
    
    // Only decrement if it's a PRODUCT and has stock management enabled
    if (item.item_type !== 'PRODUCT') return { success: true }
    
    const currentStock = item.stock_quantity || 0
    const newStock = Math.max(0, currentStock - quantity)
    
    const { error: updateError } = await supabase
        .from('items')
        .update({ 
            stock_quantity: newStock,
            status: newStock === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE'
        })
        .eq('id', itemId)
        
    if (updateError) return { error: updateError.message }
    
    revalidatePath(`/dashboard/${item.store_id}/products`)
    return { success: true }
}
