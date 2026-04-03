'use server'

import { createClient } from '@/lib/supabase/server'
import { translateDarijaForSearch } from '@/lib/darija-dictionary'

export interface ServiceDirectoryRow {
    service_id: number;
    owner_id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    status: string | null;
    rating_average: number | null;
    total_reviews: number | null;
    opening_hours: any | null;
    created_at: string | null;
    updated_at: string | null;
}

export async function searchServicesDirectory(query?: string, location?: string) {
    const supabase = createClient()

    // 1. Query service_directory
    let request = supabase
        .from('service_directory')
        .select(`
            *,
            stores (
                id,
                name,
                rating_average,
                total_reviews,
                logo_url
            )
        `)
        .eq('status', 'ACTIVE')

    if (query) {
        const translatedQuery = translateDarijaForSearch(query);
        const keywords = translatedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (keywords.length > 0) {
            keywords.forEach(keyword => {
                request = request.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`);
            });
        }
    }

    if (location) {
        request = request.ilike('city', `%${location}%`);
    }

    // 2. Query native stores acting as services (id_business is NULL)
    let storesQuery = supabase
        .from('stores')
        .select('id, name, slug, description, category, phone, address, city, latitude, longitude, rating_average, total_reviews, logo_url')
        .in('status', ['APPROVED', 'PUBLISHED'])
        .is('id_business', null); // Native stores without a business_directory link are considered services

    if (query) {
        const translatedQuery = translateDarijaForSearch(query);
        const keywords = translatedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (keywords.length > 0) {
            keywords.forEach(kw => {
                storesQuery = storesQuery.or(`name.ilike.%${kw}%,description.ilike.%${kw}%,address.ilike.%${kw}%`);
            });
        }
    }

    if (location) {
        storesQuery = storesQuery.ilike('city', `%${location}%`);
    }

    const [sdRes, storesRes] = await Promise.all([
        request.limit(50),
        storesQuery.limit(50)
    ]);

    if (sdRes.error) console.error('Error searching service directory:', sdRes.error);
    if (storesRes.error) console.error('Error searching stores for services:', storesRes.error);

    const mappedData: any[] = [];

    // Map service_directory results
    if (sdRes.data) {
        sdRes.data.forEach((item: any) => {
            const storeLogo = Array.isArray(item.stores) ? item.stores[0]?.logo_url : item.stores?.logo_url;
            
            let fallbackImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop';
            if (item.category?.toLowerCase().includes('plomb')) {
                fallbackImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
            } else if (item.category?.toLowerCase().includes('electr')) {
                fallbackImage = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop';
            }

            mappedData.push({
                ...item,
                isNative: false,
                id: item.slug || item.service_id.toString(), // prefer slug for /merchants/business/[slug]
                item_type: 'SERVICE',
                price: item.price || 0,
                main_image: storeLogo || fallbackImage
            });
        });
    }

    // Map native stores results
    if (storesRes.data) {
        storesRes.data.forEach((item: any) => {
            let fallbackImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop';
            if (item.category?.toLowerCase().includes('plomb')) fallbackImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop';
            else if (item.category?.toLowerCase().includes('electr')) fallbackImage = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop';

            mappedData.push({
                ...item,
                isNative: true,
                id: item.slug || item.id.toString(),
                item_type: 'SERVICE',
                price: item.price || 0,
                main_image: item.logo_url || fallbackImage,
                stores: { name: item.name } // Match the structure expected by the frontend
            });
        });
    }

    // Sort: prioritized native results first, then by rating desc
    mappedData.sort((a, b) => {
        if (a.isNative && !b.isNative) return -1;
        if (!a.isNative && b.isNative) return 1;
        return (b.rating_average || 0) - (a.rating_average || 0);
    });

    // Deduplicate by ID
    const uniqueMap = new Map();
    mappedData.forEach(item => {
        if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
    });

    return { data: Array.from(uniqueMap.values()), error: null }
}
