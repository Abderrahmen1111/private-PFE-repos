'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { translateDarijaForSearch } from '@/lib/darija-dictionary'
import { logUserSearch } from './user-activity'

export type SearchResultItem = {
    id: any;
    name: string;
    description: string | null;
    rating_average: number | null;
    total_reviews: number | null;
    item_type: 'PRODUCT' | 'SERVICE';
    main_image?: string | null;
    price?: number | null;
    store_id?: number | null;
    created_at?: string | null;
    stores?: {
        id: number
        name: string
        rating_average: number | null
        total_reviews: number | null
    }
} & any;

export async function searchItems(query?: string, category?: string) {
    const supabase = createClient()
    
    // Log search for recommendation engine
    if (query) {
        logUserSearch(query);
    }

    let request = supabase
        .from('items')
        .select(`
      *,
      stores (
        id,
        name,
        slug,
        rating_average,
        total_reviews
      )
    `)
        .eq('status', 'AVAILABLE')
        .not('store_id', 'is', null) // Filter for items linked to a store

    if (query) {
        const translatedQuery = translateDarijaForSearch(query);
        const noiseWords = new Set(['je', 'tu', 'il', 'elle', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du', 'au', 'aux', 'mon', 'ma', 'mes', 'pour', 'trouver', 'veux', 'où', 'a', 'à', 'est', 'sont', 'y', 'dans', 'avec', 'et', 'ou', 'moi', 'toi']);
        
        let targetString = translatedQuery !== query ? translatedQuery : query;
        // Clean: remove ALL special chars that break PostgREST (commas, parens, dots, etc.)
        let keywords = targetString
            .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F]/g, '') // keep only letters, digits, spaces, Arabic
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 1 && !noiseWords.has(w));
        
        // Also add original query as a keyword for direct Arabic matching
        if (translatedQuery !== query) {
            keywords.push(query.toLowerCase());
        }
        
        if (keywords.length === 0) keywords = [query.toLowerCase()];

        // Build OR filters for each keyword
        const orFilters = keywords.map(keyword => 
            `name.ilike.%${keyword}%,description.ilike.%${keyword}%`
        ).join(',');
        request = request.or(orFilters);
    }

    const { data, error } = await request.order('created_at', { ascending: false })

    if (error) {
        console.error('Error searching items:', error)
        return { data: [], error: error.message }
    }

    return { data: data as any[], error: null }
}
