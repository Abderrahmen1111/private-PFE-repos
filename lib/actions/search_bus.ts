'use server'

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'

export async function searchStores(queryStr: string = '', locationStr: string = ''): Promise<Business[]> {
    const supabase = createClient()

    let queryBuilder = supabase
        .from('business_directory_tunisia' as any)
        .select('id, title, city, phone, full_address, vitrine_category, categoryName, latitude, longitude, totalScore, reviewsCount, photos')

    if (queryStr) {
        queryBuilder = queryBuilder.or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%,full_address.ilike.%${queryStr}%`)
    }

    if (locationStr) {
        queryBuilder = queryBuilder.ilike('city', `%${locationStr}%`)
    }

    const { data, error } = await queryBuilder.limit(100)


    if (error) {
        console.error('Error searching business directory:', error)
        return []
    }

    return (data || []).map((item: any) => ({
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
    }))
}
