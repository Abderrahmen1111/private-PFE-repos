'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getOwnerProfileData(businessId?: number | string) {
    const supabase = createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch User Profile
    const userRes = await supabase
        .from('users' as any)
        .select('*')
        .eq('id', user.id)
        .single();
        
    const userError = userRes.error;
    const userData = userRes.data as any;

    if (userError) {
        console.error("Error fetching user data:", userError)
    }

    // 3. Fetch primary Store owned by this user
    let storeRes;
    
    if (businessId) {
        // Try getting by id_business first (the foreign key)
        storeRes = await supabase
            .from('stores' as any)
            .select('*')
            .eq('id_business', businessId)
            .single();
            
        // Fallback to primary key id if id_business not found
        if (storeRes.error || !storeRes.data) {
             storeRes = await supabase
                .from('stores' as any)
                .select('*')
                .eq('id', businessId)
                .single();
        }
    } else {
        storeRes = await supabase
            .from('stores' as any)
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
    }
        
    const storeError = storeRes.error;
    const storeData = storeRes.data as any;

    if (storeError && storeError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
       console.error("Error fetching store data:", storeError)
    }

    // 4. Fetch metrics (derived or direct from store)
    let reviewsCount = 0;
    let avgRating = 0;
    let totalViews = storeData?.view_count || 0;
    let recentReviews: any[] = [];
    let bookingsCount = 0;

    if (storeData) {
        // Fetch accurate review metrics
        const reviewsRes = await supabase
            .from('reviews' as any)
            .select(`
                id,
                rating,
                comment,
                created_at,
                vendor_response,
                users!author_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq('store_id', storeData.id)
            .order('created_at', { ascending: false });
            
        const reviewsError = reviewsRes.error;
        const storeReviews = reviewsRes.data as any[] | null;
        
        if (!reviewsError && storeReviews) {
            reviewsCount = storeReviews.length;
            avgRating = reviewsCount > 0 
                ? Number((storeReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount).toFixed(1))
                : 0;
            
            // Get top 5 recent reviews for the widget
            recentReviews = storeReviews.slice(0, 5).map((r: any) => ({
                id: r.id.toString(),
                author: (r.users as any)?.full_name || 'Anonymous',
                avatar: (r.users as any)?.avatar_url ? (r.users as any).avatar_url : ((r.users as any)?.full_name ? (r.users as any).full_name.substring(0, 2).toUpperCase() : 'U'),
                rating: r.rating,
                date: new Date(r.created_at || '').toLocaleDateString(),
                text: r.comment,
                replied: !!r.vendor_response
            }));
        }

        // Fetch bookings count
        const countRes = await supabase
            .from('bookings' as any)
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeData.id);
            
        const countError = countRes.error;
        const count = countRes.count;
        
        if (!countError) {
            bookingsCount = count || 0;
        }
    }

    return {
        user: {
            ...user,
            profile: userData,
            avatar: userData?.avatar_url || null,
            email: user.email,
        },
        store: storeData,
        metrics: {
            reviewsCount,
            avgRating,
            totalViews,
            bookingsCount,
        },
        recentReviews,
    }
}
