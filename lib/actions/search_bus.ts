'use server'

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'
import { translateDarijaForSearch } from '@/lib/darija-dictionary'

export async function searchStores(queryStr: string = '', locationStr: string = ''): Promise<Business[]> {
    const supabase = createClient()

    // 1. Search native stores
    let storesQuery = supabase
        .from('stores')
        .select('id, name, slug, city, phone, address, category, latitude, longitude, rating_average, total_reviews, logo_url, description')
        .in('status', ['APPROVED', 'PUBLISHED'])
        .is('service_id', null)

    if (queryStr) {
        const translatedQuery = translateDarijaForSearch(queryStr);
        const noiseWords = new Set(['je', 'tu', 'il', 'elle', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du', 'au', 'aux', 'mon', 'ma', 'mes', 'pour', 'trouver', 'veux', 'où', 'a', 'à', 'est', 'sont', 'y', 'dans', 'avec', 'et', 'ou', 'moi', 'toi']);
        let targetString = translatedQuery !== queryStr ? translatedQuery : queryStr;
        let keywords = targetString.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !noiseWords.has(w));
        if (keywords.length === 0) keywords = [queryStr.toLowerCase()];
        keywords.forEach(kw => {
            storesQuery = storesQuery.or(`name.ilike.%${kw}%,description.ilike.%${kw}%,address.ilike.%${kw}%`);
        });
    }

    if (locationStr) {
        storesQuery = storesQuery.ilike('city', `%${locationStr}%`)
    }

    // 2. Search business directory
    let dirQuery = supabase
        .from('business_directory_tunisia' as any)
        .select('id, title, city, phone, full_address, vitrine_category, categoryName, latitude, longitude, totalScore, reviewsCount, photos')

    if (queryStr) {
        const translatedQuery = translateDarijaForSearch(queryStr);
        const noiseWords = new Set(['je', 'tu', 'il', 'elle', 'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du', 'au', 'aux', 'mon', 'ma', 'mes', 'pour', 'trouver', 'veux', 'où', 'a', 'à', 'est', 'sont', 'y', 'dans', 'avec', 'et', 'ou', 'moi', 'toi']);
        let targetString = translatedQuery !== queryStr ? translatedQuery : queryStr;
        let keywords = targetString.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !noiseWords.has(w));
        if (keywords.length === 0) keywords = [queryStr.toLowerCase()];
        keywords.forEach(kw => {
            dirQuery = dirQuery.or(`title.ilike.%${kw}%,categoryName.ilike.%${kw}%,vitrine_category.ilike.%${kw}%,full_address.ilike.%${kw}%`);
        });
    }

    if (locationStr) {
        dirQuery = dirQuery.ilike('city', `%${locationStr}%`)
    }

    const [storesRes, dirRes] = await Promise.all([
        storesQuery.limit(50),
        dirQuery.limit(50)
    ]);

    const results: (Business & { isNative?: boolean })[] = [];

    if (storesRes.data) {
        storesRes.data.forEach((item: any) => {
            results.push({
                isNative: true,
                id: item.slug || item.id.toString(),
                name: item.name || '',
                image: item.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                rating: Number(item.rating_average) || 0,
                reviewCount: item.total_reviews || 0,
                category: item.category || 'Other',
                priceRange: '$$',
                isOpen: true,
                description: item.description || item.address || '',
                location: {
                    address: item.address || '',
                    lat: (!isNaN(Number(item.latitude)) && item.latitude !== null) ? Number(item.latitude) : 36.8065,
                    lng: (!isNaN(Number(item.longitude)) && item.longitude !== null) ? Number(item.longitude) : 10.1815,
                }
            });
        });
    }

    if (dirRes.data) {
        dirRes.data.forEach((item: any) => {
            results.push({
                isNative: false,
                id: item.id.toString(),
                name: item.title || '',
                image: (item.photos && item.photos.length > 0) ? item.photos[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                rating: Number(item.totalScore) || 0,
                reviewCount: item.reviewsCount || 0,
                category: item.vitrine_category || item.categoryName || 'Other',
                priceRange: '$$',
                isOpen: true,
                description: item.full_address || '',
                location: {
                    address: item.full_address || '',
                    lat: (!isNaN(Number(item.latitude)) && item.latitude !== null) ? Number(item.latitude) : 36.8065,
                    lng: (!isNaN(Number(item.longitude)) && item.longitude !== null) ? Number(item.longitude) : 10.1815,
                }
            });
        });
    }

    // Sort: prioritized native results first, then by rating
    return results.sort((a, b) => {
        if (a.isNative && !b.isNative) return -1;
        if (!a.isNative && b.isNative) return 1;
        return b.rating - a.rating;
    }).slice(0, 100);
}
