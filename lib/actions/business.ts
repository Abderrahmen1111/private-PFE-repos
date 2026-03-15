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

    // Try to find a store linked to this directory item
    const { data: storeData } = await supabase
        .from('stores')
        .select('id, opening_hours, status, gallery, logo_url')
        .eq('id_business', id)
        .maybeSingle();

    // If not found, maybe the ID passed is already the store ID
    let finalStore = storeData;
    if (!finalStore) {
        const { data: directStore } = await supabase
            .from('stores')
            .select('id, opening_hours, status, gallery, logo_url')
            .eq('id', id)
            .maybeSingle();
        finalStore = directStore;
    }

    const item = data as any
    const workingHours = (finalStore as any)?.opening_hours;
    const logoUrl = (finalStore as any)?.logo_url;

    return {
        id: item.id.toString(),
        store_id: (finalStore as any)?.id,
        id_business: item.id,
        status: (finalStore as any)?.status,
        name: item.title || '',
        image: logoUrl || ((item.photos && item.photos.length > 0) ? item.photos[0] : undefined),
        rating: Number(item.totalScore) || 0,
        reviewCount: item.reviewsCount || 0,
        category: item.vitrine_category || item.categoryName || 'Other',
        priceRange: item.price_range || undefined,
        isOpen: true, // Fallback for simple status
        workingHours: workingHours || undefined,
        description: item.description || item.full_address || '',
        phone: item.phone || undefined,
        website: item.website || undefined,
        photos: item.photos || [],
        gallery: (finalStore as any)?.gallery || [],
        location: {
            address: item.full_address || '',
            lat: (!isNaN(Number(item.latitude)) && item.latitude !== null) ? Number(item.latitude) : 36.8065,
            lng: (!isNaN(Number(item.longitude)) && item.longitude !== null) ? Number(item.longitude) : 10.1815,
        }
    }

}

