'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardOverview(storeId: number) {
    const supabase = createClient()

    // 1. Fetch Store Basic Info
    const { data: store } = await supabase
        .from('stores')
        .select('view_count, total_orders, created_at, status')
        .eq('id', storeId)
        .single()

    // 2. Fetch Total Counts
    const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)

    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId)

    // 3. Fetch Ratings for Distribution
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('store_id', storeId)
        .eq('is_approved', true)

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (reviews && Array.isArray(reviews)) {
        (reviews as any[]).forEach(r => {
            const ratingInt = Math.round(r.rating)
            if (ratingInt >= 1 && ratingInt <= 5) {
                ratingCounts[ratingInt as keyof typeof ratingCounts]++
            }
        })
    }

    // 4. Fetch Recent Activity for the Feed
    const { data: recentReviews } = await (supabase as any)
        .from('reviews')
        .select('id, rating, created_at, author:author_id(full_name)')
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(5)

    const { data: recentOrders } = await (supabase as any)
        .from('orders')
        .select('id, total_price, created_at, customer_name')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5)

    const { data: recentBookings } = await (supabase as any)
        .from('bookings')
        .select('id, price, created_at, customer_name')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5)

    // 5. Fetch 7-Day Trend Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { data: weeklyOrders } = await supabase
        .from('orders')
        .select('created_at')
        .eq('store_id', storeId)
        .gt('created_at', sevenDaysAgoISO);

    const { data: weeklyBookings } = await supabase
        .from('bookings')
        .select('created_at')
        .eq('store_id', storeId)
        .gt('created_at', sevenDaysAgoISO);

    const { data: weeklyReviews } = await supabase
        .from('reviews')
        .select('created_at')
        .eq('store_id', storeId)
        .gt('created_at', sevenDaysAgoISO);

    // Prepare weekly data for Recharts
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days: any[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push({
            day: days[d.getDay()],
            fullDate: d.toISOString().split('T')[0],
            views: 0, // Profile views per day not yet tracked in a separate table
            clicks: 0,
            actions: 0 // Combined Bookings + Orders + Reviews
        });
    }

    // Aggregate counts
    const aggregate = (data: any[], key: 'actions' | 'clicks' | 'views') => {
        if (!data) return;
        data.forEach(item => {
            const date = item.created_at.split('T')[0];
            const dayObj = last7Days.find(d => d.fullDate === date);
            if (dayObj) dayObj[key]++;
        });
    };

    aggregate(weeklyOrders || [], 'actions');
    aggregate(weeklyBookings || [], 'actions');
    aggregate(weeklyReviews || [], 'actions');

    const allActions = [
        ...(recentReviews || []).map((r: any) => ({
            id: `review-${r.id}`,
            type: 'review',
            details: `${r.author?.full_name || 'Un client'} a laissé un avis de ${r.rating} étoiles`,
            timestamp: new Date(r.created_at)
        })),
        ...(recentOrders || []).map((o: any) => ({
            id: `order-${o.id}`,
            type: 'order',
            details: `${o.customer_name} a passé une commande (${o.total_price} DT)`,
            timestamp: new Date(o.created_at)
        })),
        ...(recentBookings || []).map((b: any) => ({
            id: `booking-${b.id}`,
            type: 'booking',
            details: `${b.customer_name} a effectué une réservation`,
            timestamp: new Date(b.created_at)
        }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)

    return {
        profileViews: (store as any)?.view_count || 0,
        phoneClicks: 0,
        directionClicks: 0,
        reservations: bookingsCount || 0,
        purchases: ordersCount || 0,
        ratingData: [
            { rating: '5 stars', count: ratingCounts[5] },
            { rating: '4 stars', count: ratingCounts[4] },
            { rating: '3 stars', count: ratingCounts[3] },
            { rating: '2 stars', count: ratingCounts[2] },
            { rating: '1 star', count: ratingCounts[1] },
        ],
        recentActions: allActions,
        weeklyStats: last7Days,
        status: (store as any)?.status || 'PENDING'
    }
}

export async function getStoreReviews(storeId: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('reviews')
        .select(`id, rating, comment, created_at, vendor_response, responded_at,
      author:author_id(full_name, avatar_url)`)
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
    if (error) { console.error('Error fetching reviews:', error); return [] }
    return data || []
}

export async function saveVendorResponse(reviewId: number, response: string) {
    const supabase = createClient()
    const { error } = await (supabase as any)
        .from('reviews')
        .update({ vendor_response: response, responded_at: new Date().toISOString() })
        .eq('id', reviewId)
    if (error) { console.error('Error saving response:', error); return { success: false } }
    return { success: true }
}

export async function getAccountDetails(storeId: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: store } = await supabase
        .from('stores')
        .select('id, name, created_at, updated_at, status, owner_id')
        .eq('id', storeId)
        .single()
    const { data: subscription } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', (store as any)?.owner_id || '')
        .maybeSingle()
    return { store, user, subscription }
}

export async function getLeadActions(storeId: number) {
    const supabase = createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, created_at, total_price, status')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50)
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, customer_name, customer_phone, created_at, price, status')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50)
    return { orders: orders || [], bookings: bookings || [] }
}



export async function getSidebarStats(storeId: number) {
    const supabase = createClient()

    const [itemsCount, reviewsCount, ordersCount, bookingsCount] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    ])

    return {
        products: itemsCount.count || 0,
        reviews: reviewsCount.count || 0,
        leads: (ordersCount.count || 0) + (bookingsCount.count || 0),
    }
}
