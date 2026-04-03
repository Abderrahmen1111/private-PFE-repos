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

export async function getUserProfileData() {
    const supabase = createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch User Profile
    const { data: userData, error: userError } = await supabase
        .from('users' as any)
        .select('*')
        .eq('id', user.id)
        .single() as any;
        
    if (userError) {
        console.error("Error fetching user data:", userError)
    }

    // 3. Fetch Statistics
    // - Reviews count
    const { count: reviewsCount } = await supabase
        .from('reviews' as any)
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

    // - Bookings count
    const { count: bookingsCount } = await supabase
        .from('bookings' as any)
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id);

    // - Orders count (optional activity)
    const { count: ordersCount } = await supabase
        .from('orders' as any)
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id);

    // - Saved places count
    const { count: savedCount } = await supabase
        .from('saved_places' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // 4. Fetch User's Orders (with Store info) for the new Orders tab
    const { data: userOrders, error: ordersError } = await supabase
        .from('orders' as any)
        .select(`
            *,
            stores!store_id (
                name,
                logo_url,
                category
            )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error("Error fetching user orders:", ordersError)
    }

    // 5. Fetch User's Reviews (with Store info)
    const { data: userReviews, error: reviewsError } = await supabase
        .from('reviews' as any)
        .select(`
            *,
            stores!store_id (
                name,
                logo_url,
                category
            )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

    if (reviewsError) {
        console.error("Error fetching user reviews:", reviewsError)
    }

    // Fetch all bookings for the reservations tab
    const { data: userBookings, error: bookingsError } = await supabase
        .from('bookings' as any)
        .select(`
            *,
            stores!store_id (
                name,
                logo_url,
                category
            ),
            items!item_id (
                name,
                main_image
            )
        `)
        .eq('customer_id', user.id)
        .order('booking_date', { ascending: false });

    if (bookingsError) {
        console.error("Error fetching user bookings:", bookingsError)
    }

    // 6. Fetch User's Saved Places
    const { data: userSavedPlaces, error: savedError } = await supabase
        .from('saved_places' as any)
        .select(`
            *,
            stores!store_id (
                id,
                name,
                logo_url,
                category,
                address,
                rating_average
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (savedError) {
        console.error("Error fetching user saved places:", savedError)
    }

    // 7. Fetch Activity (Latest 10 items from Reviews, Bookings, Orders)
    // Combine and sort by date for a unified feed
    const activityItems: any[] = [];
    
    if (userReviews) {
        userReviews.slice(0, 3).forEach((r: any) => {
            activityItems.push({
                id: `rev-${r.id}`,
                type: 'review',
                text: 'You wrote a review for',
                businessName: r.stores?.name || 'a business',
                timestamp: r.created_at,
                dateObj: new Date(r.created_at)
            });
        });
    }

    if (userOrders) {
        userOrders.slice(0, 3).forEach((o: any) => {
            activityItems.push({
                id: `order-${o.id}`,
                type: 'order',
                text: 'You placed an order with',
                businessName: o.stores?.name || 'a business',
                timestamp: o.created_at,
                dateObj: new Date(o.created_at)
            });
        });
    }

    // Fetch latest bookings for activity
    if (userBookings) {
        userBookings.slice(0, 3).forEach((b: any) => {
            activityItems.push({
                id: `book-${b.id}`,
                type: 'visited',
                text: 'You booked a session at',
                businessName: b.stores?.name || 'a business',
                timestamp: b.created_at,
                dateObj: new Date(b.created_at)
            });
        });
    }

    // Sort combined activity
    const sortedActivity = activityItems
        .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
        .map(({ dateObj, ...rest }) => ({
            ...rest,
            timestamp: new Date(rest.timestamp).toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            })
        }));

    return {
        user: {
            ...user,
            profile: userData,
            avatar: userData?.avatar_url || null,
            email: user.email,
        },
        stats: {
            reviewsCount: reviewsCount || 0,
            bookingsCount: bookingsCount || 0,
            ordersCount: ordersCount || 0,
            savedCount: savedCount || 0,
            citiesCount: 1, 
            helpfulVotes: 0,
        },
        savedPlaces: (userSavedPlaces || []).map((s: any) => ({
            id: s.id.toString(),
            storeId: s.stores?.id,
            businessName: s.stores?.name || 'Unknown Business',
            businessImage: s.stores?.logo_url || '/placeholder-business.png',
            businessCategory: s.stores?.category || 'General',
            address: s.stores?.address || '',
            rating: s.stores?.rating_average || 0,
            date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        })),
        reviews: (userReviews || []).map((r: any) => ({
            id: r.id.toString(),
            businessName: r.stores?.name || 'Unknown Business',
            businessImage: r.stores?.logo_url || '/placeholder-business.png',
            businessCategory: r.stores?.category || 'General',
            rating: r.rating,
            reviewText: r.comment,
            date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            helpfulCount: 0,
        })),
        orders: (userOrders || []).map((o: any) => ({
            id: o.id.toString(),
            order_number: o.order_number,
            businessName: o.stores?.name || 'Unknown Business',
            businessImage: o.stores?.logo_url || o.stores?.banner_url || null,
            status: o.status,
            total_price: o.total_price,
            date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        })),
        bookings: userBookings || [],
        activity: sortedActivity,
    }
}
