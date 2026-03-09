'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export type SearchResultItem = Database['public']['Tables']['items']['Row'] & {
    stores: {
        id: number
        name: string
        rating_average: number | null
        total_reviews: number | null
    }
}

export async function searchItems(query?: string, category?: string) {
    const supabase = createClient()

    let request = supabase
        .from('items')
        .select(`
      *,
      stores (
        id,
        name,
        rating_average,
        total_reviews
      )
    `)
        .eq('status', 'AVAILABLE')

    if (query) {
        request = request.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (category && category !== 'all' && category !== 'other') {
        // Note: In our current schema, category matching is a bit loose 
        // since we use item_type (PRODUCT/SERVICE) mainly.
        // If we have a category field on items soon, we'd use it here.
        if (category === 'services') {
            request = request.eq('item_type', 'SERVICE')
        } else {
            request = request.eq('item_type', 'PRODUCT')
        }
    }

    const { data, error } = await request.order('created_at', { ascending: false })

    if (error) {
        console.error('Error searching items:', error)
        return { data: [], error: error.message }
    }

    return { data: data as SearchResultItem[], error: null }
}
