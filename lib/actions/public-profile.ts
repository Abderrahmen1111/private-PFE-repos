'use server'

import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC PROFILE ACTIONS (no authentication required)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch a public business/store profile by store ID.
 * No authentication needed — used on /public/business/[id].
 */
export async function getPublicBusinessProfile(storeId: number) {
    const supabase = createClient()

    // 1. Fetch Store
    const { data: store, error: storeError } = await supabase
        .from('stores' as any)
        .select('*')
        .eq('id', storeId)
        .single() as any;

    if (storeError || !store) {
        return null;
    }

    // 2. Fetch Items (products + services)
    const { data: items } = await supabase
        .from('items' as any)
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: false })
        .limit(12) as any;

    // 3. Fetch Reviews with author info
    const { data: reviews } = await supabase
        .from('reviews' as any)
        .select(`
            id,
            rating,
            title,
            comment,
            created_at,
            vendor_response,
            responded_at,
            users!author_id (
                id,
                full_name,
                avatar_url,
                city
            )
        `)
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20) as any;

    // 4. Fetch Owner info (public fields only)
    const { data: owner } = await supabase
        .from('users' as any)
        .select('id, full_name, avatar_url, city, created_at')
        .eq('id', store.owner_id)
        .single() as any;

    // 5. Calculate rating distribution
    const allReviews = reviews || [];
    const reviewsCount = allReviews.length;
    const avgRating = reviewsCount > 0
        ? Number((allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount).toFixed(1))
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        stars: star,
        count: allReviews.filter((r: any) => r.rating === star).length,
        percentage: reviewsCount > 0
            ? Math.round((allReviews.filter((r: any) => r.rating === star).length / reviewsCount) * 100)
            : 0,
    }));

    // 6. Parse gallery
    let gallery: string[] = [];
    if (store.gallery) {
        try {
            gallery = Array.isArray(store.gallery) ? store.gallery : JSON.parse(store.gallery);
        } catch { gallery = []; }
    }
    if (store.banner_url) gallery.unshift(store.banner_url);
    if (store.logo_url && !gallery.includes(store.logo_url)) gallery.unshift(store.logo_url);

    // 7. Parse opening hours
    let openingHours: { day: string; hours: string }[] = [];
    if (store.opening_hours) {
        try {
            const hours = typeof store.opening_hours === 'string'
                ? JSON.parse(store.opening_hours)
                : store.opening_hours;
            openingHours = Object.entries(hours).map(([day, h]: [string, any]) => ({
                day,
                hours: typeof h === 'string' ? h : h?.open && h?.close ? `${h.open} – ${h.close}` : (h?.closed ? 'Fermé' : 'N/A'),
            }));
        } catch { openingHours = []; }
    }

    return {
        store: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            description: store.description,
            category: store.category,
            phone: store.phone,
            email: store.email,
            website: store.website,
            address: store.address,
            city: store.city,
            latitude: store.latitude,
            longitude: store.longitude,
            logo_url: store.logo_url,
            banner_url: store.banner_url,
            status: store.status,
            verified_at: store.verified_at,
            created_at: store.created_at,
        },
        owner: owner ? {
            id: owner.id,
            name: owner.full_name,
            avatar_url: owner.avatar_url,
            city: owner.city,
            memberSince: owner.created_at,
        } : null,
        items: (items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: item.price,
            price_unit: item.price_unit,
            item_type: item.item_type,
            main_image: item.main_image,
            image_2: item.image_2,
            image_3: item.image_3,
            rating_average: item.rating_average,
            total_reviews: item.total_reviews,
            is_bookable: item.is_bookable,
            duration_minutes: item.duration_minutes,
        })),
        reviews: allReviews.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            created_at: r.created_at,
            vendor_response: r.vendor_response,
            responded_at: r.responded_at,
            author: {
                id: (r.users as any)?.id,
                name: (r.users as any)?.full_name || 'Anonyme',
                avatar_url: (r.users as any)?.avatar_url,
                city: (r.users as any)?.city,
            },
        })),
        stats: {
            reviewsCount,
            avgRating,
            ratingDistribution,
            totalViews: store.view_count || 0,
            totalOrders: store.total_orders || 0,
        },
        gallery,
        openingHours,
    };
}

/**
 * Fetch a public user profile by user ID.
 * No authentication needed — used on /public/user/[id].
 */
export async function getPublicUserProfile(userId: string) {
    const supabase = createClient()

    // 1. Fetch User public data
    const { data: userData, error: userError } = await supabase
        .from('users' as any)
        .select('id, full_name, avatar_url, city, created_at, role')
        .eq('id', userId)
        .single() as any;

    if (userError || !userData) {
        return null;
    }

    // 2. Fetch user's reviews with store info
    const { data: userReviews } = await supabase
        .from('reviews' as any)
        .select(`
            id,
            rating,
            title,
            comment,
            created_at,
            stores!store_id (
                id,
                name,
                logo_url,
                category,
                city
            )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false }) as any;

    // 3. Count stats
    const { count: reviewsCount } = await supabase
        .from('reviews' as any)
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

    const { count: bookingsCount } = await supabase
        .from('bookings' as any)
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', userId);

    const { count: ordersCount } = await supabase
        .from('orders' as any)
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', userId);

    // 4. Generate badges based on activity
    const totalReviews = reviewsCount || 0;
    const totalBookings = bookingsCount || 0;
    const totalOrders = ordersCount || 0;

    const badges = [];

    if (totalReviews >= 1) badges.push({ id: 'first-review', title: 'Premier Avis', description: 'A écrit son premier avis', icon: 'star', earned: true });
    if (totalReviews >= 5) badges.push({ id: 'reviewer', title: 'Critique Actif', description: '5+ avis publiés', icon: 'award', earned: true });
    if (totalReviews >= 20) badges.push({ id: 'top-reviewer', title: 'Top Reviewer', description: '20+ avis publiés', icon: 'trophy', earned: true });
    if (totalBookings >= 1) badges.push({ id: 'first-booking', title: 'Première Réservation', description: 'A effectué sa première réservation', icon: 'calendar', earned: true });
    if (totalBookings >= 10) badges.push({ id: 'loyal-client', title: 'Client Fidèle', description: '10+ réservations effectuées', icon: 'heart', earned: true });
    if (totalOrders >= 1) badges.push({ id: 'first-order', title: 'Première Commande', description: 'A passé sa première commande', icon: 'shopping-bag', earned: true });
    if (totalOrders >= 10) badges.push({ id: 'big-shopper', title: 'Grand Acheteur', description: '10+ commandes passées', icon: 'zap', earned: true });

    // Add locked badges for motivation
    if (totalReviews < 1) badges.push({ id: 'first-review', title: 'Premier Avis', description: 'Écrire son premier avis', icon: 'star', earned: false });
    if (totalReviews < 5) badges.push({ id: 'reviewer', title: 'Critique Actif', description: 'Publier 5 avis', icon: 'award', earned: false });
    if (totalBookings < 1) badges.push({ id: 'first-booking', title: 'Première Réservation', description: 'Effectuer une réservation', icon: 'calendar', earned: false });

    // Compute average rating given
    const reviews = userReviews || [];
    const avgRatingGiven = reviews.length > 0
        ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    return {
        user: {
            id: userData.id,
            name: userData.full_name || 'Utilisateur',
            avatar_url: userData.avatar_url,
            city: userData.city || 'Tunisie',
            memberSince: userData.created_at,
            role: userData.role,
        },
        stats: {
            reviewsCount: totalReviews,
            bookingsCount: totalBookings,
            ordersCount: totalOrders,
            avgRatingGiven,
        },
        reviews: reviews.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            created_at: r.created_at,
            store: {
                id: (r.stores as any)?.id,
                name: (r.stores as any)?.name || 'Commerce',
                logo_url: (r.stores as any)?.logo_url,
                category: (r.stores as any)?.category,
                city: (r.stores as any)?.city,
            },
        })),
        badges,
    };
}
