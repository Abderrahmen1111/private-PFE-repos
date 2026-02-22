'use server'

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'

export async function getBusinessById(id: string): Promise<Business | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('business_directory_tunisia' as any)
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        if (error) console.error('Error fetching business by ID:', error)
        return null
    }

    const item = data as any

    return {
        id: item.id.toString(),
        name: item.title || '',
        image: (item.photos && item.photos.length > 0) ? item.photos[0] : undefined,
        rating: Number(item.totalScore) || 0,
        reviewCount: item.reviewsCount || 0,
        category: item.vitrine_category || item.categoryName || 'Other',
        priceRange: item.price_range || undefined, // Check if this column exists
        isOpen: undefined, // Removed hardcoded true
        description: item.description || item.full_address || '',
        phone: item.phone || undefined,
        website: item.website || undefined,
        photos: item.photos || [],
        location: {
            address: item.full_address || '',
            lat: (!isNaN(Number(item.latitude)) && item.latitude !== null) ? Number(item.latitude) : 36.8065,
            lng: (!isNaN(Number(item.longitude)) && item.longitude !== null) ? Number(item.longitude) : 10.1815,
        }
    }

}

