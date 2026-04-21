'use server'

import { createClient } from '@/lib/supabase/server'
import { Business } from '@/types/business'

export async function getBusinessById(id: string): Promise<Business | null> {
    const supabase = createClient();
    const isNumeric = /^\d+$/.test(id);

    // 1. Try fetching from stores (by slug or numeric id)
    let storeQuery = supabase.from('stores')
        .select('id, owner_id, id_business, name, slug, description, category, phone, email, website, address, city, rating_average, total_reviews, opening_hours, status, gallery, logo_url');
    if (isNumeric) {
        storeQuery = storeQuery.eq('id', Number(id));
    } else {
        storeQuery = storeQuery.eq('slug', id);
    }
    const { data: storeData } = await storeQuery.maybeSingle() as { data: any };

    let directoryData: any = null;

    // 2. If a store is found with a linked business_directory profile, fetch it
    if (storeData?.id_business) {
        const { data: dirData } = await supabase
            .from('business_directory_tunisia' as any)
            .select('*')
            .eq('id', storeData.id_business)
            .maybeSingle();
        directoryData = dirData;
    }
    // 3. No store found — try business_directory_tunisia directly (numeric only)
    else if (!storeData && isNumeric) {
        const { data: dirData } = await supabase
            .from('business_directory_tunisia' as any)
            .select('*')
            .eq('id', Number(id))
            .maybeSingle();
        directoryData = dirData;

        // Also check if a store is linked to this directory entry
        if (directoryData) {
            const { data: orphanStore } = await supabase
                .from('stores')
                .select('id, owner_id, id_business, name, slug, description, category, phone, email, website, address, city, rating_average, total_reviews, opening_hours, status, gallery, logo_url')
                .eq('id_business', Number(id))
                .maybeSingle();
            if (orphanStore) (storeData as any) || Object.assign({}, orphanStore);
        }
    }

    // 4. Nothing found in stores or business_directory — try service_directory
    let serviceDir: any = null;
    if (!storeData && !directoryData) {
        // Try by slug first (non-numeric), then by service_id (numeric)
        const sdQuery = supabase
            .from('service_directory' as any)
            .select('service_id, owner_id, name, slug, description, category, phone, address, city, latitude, longitude, rating_average, total_reviews, opening_hours, status');

        const { data: sd } = isNumeric
            ? await sdQuery.eq('service_id', Number(id)).maybeSingle()
            : await sdQuery.eq('slug', id).maybeSingle();

        serviceDir = sd;
    }

    if (!storeData && !directoryData && !serviceDir) return null;

    // 5. Build unified Business object
    const sData: any = storeData || {};
    const dData: any = directoryData || {};
    const sdData: any = serviceDir || {};

    // Service directory takes over if no store/directory found
    if (serviceDir && !storeData && !directoryData) {
        return {
            id: sdData.service_id?.toString() || id,
            store_id: undefined,
            owner_id: sdData.owner_id || undefined,
            id_business: undefined,
            status: sdData.status || 'ACTIVE',
            name: sdData.name || '',
            image: undefined,
            rating: Number(sdData.rating_average) || 0,
            reviewCount: Number(sdData.total_reviews) || 0,
            category: sdData.category || 'Service',
            priceRange: undefined,
            isOpen: true,
            workingHours: sdData.opening_hours || undefined,
            description: sdData.description || '',
            phone: sdData.phone || undefined,
            website: undefined,
            photos: [],
            gallery: [],
            location: {
                address: sdData.address || sdData.city || '',
                lat: (!isNaN(Number(sdData.latitude)) && sdData.latitude !== null) ? Number(sdData.latitude) : 36.8065,
                lng: (!isNaN(Number(sdData.longitude)) && sdData.longitude !== null) ? Number(sdData.longitude) : 10.1815,
            }
        } as Business;
    }

    return {
        id: (directoryData ? dData.id?.toString() : sData?.id?.toString()) || id,
        store_id: sData.id,
        owner_id: sData.owner_id || undefined,
        id_business: dData.id || undefined,
        status: sData.status || (directoryData ? 'PUBLISHED' : 'DRAFT'),
        name: sData.name || dData.title || '',
        image: sData.logo_url || ((dData.photos?.length > 0) ? dData.photos[0] : undefined),
        rating: Number(sData.rating_average || dData.totalScore) || 0,
        reviewCount: Number(sData.total_reviews || dData.reviewsCount) || 0,
        category: sData.category || dData.vitrine_category || dData.categoryName || 'Other',
        priceRange: dData.price_range || undefined,
        isOpen: true,
        workingHours: sData.opening_hours || undefined,
        description: sData.description || dData.description || dData.full_address || '',
        phone: sData.phone || dData.phone || undefined,
        website: sData.website || dData.website || undefined,
        photos: dData.photos || [],
        gallery: sData.gallery || [],
        location: {
            address: sData.address || dData.full_address || '',
            lat: (!isNaN(Number(dData.latitude)) && dData.latitude !== null) ? Number(dData.latitude) : 36.8065,
            lng: (!isNaN(Number(dData.longitude)) && dData.longitude !== null) ? Number(dData.longitude) : 10.1815,
        }
    } as Business;
}

export async function getLatestStores(limit: number = 10) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('stores')
        .select('id, name, logo_url, status')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching latest stores:', error)
        return []
    }

    return data || []
}

