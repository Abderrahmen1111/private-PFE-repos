'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

    // 3. Fetch all stores owned by this user (same matching as client profile)
    const email = user.email;
    const ownerStoresFilter = email
        ? `owner_id.eq.${user.id},email.eq.${email}`
        : `owner_id.eq.${user.id}`;

    const { data: ownedStoresRaw, error: storesListError } = await (supabase
        .from('stores' as any)
        .select('*')
        .or(ownerStoresFilter)
        .order('created_at', { ascending: true }) as any);

    if (storesListError) {
        console.error('Error fetching owner stores list:', storesListError);
    }

    const allStores: any[] = Array.isArray(ownedStoresRaw) ? ownedStoresRaw : [];

    const storesPayload = allStores.map((s: any) => ({
        id: s.id,
        id_business: s.id_business ?? null,
        name: s.name,
        logo_url: s.logo_url ?? null,
        status: s.status ?? null,
        category: s.category ?? null,
    }));

    const parseBusinessId = (raw: number | string | undefined) => {
        if (raw === undefined || raw === null || raw === '') return null;
        if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
        const s = String(raw).trim();
        if (!s) return null;
        return /^\d+$/.test(s) ? Number(s) : null;
    };

    const bid = parseBusinessId(businessId as any);
    let storeData: any = null;
    if (bid !== null && allStores.length > 0) {
        storeData =
            allStores.find((s: any) => s.id === bid || s.id_business === bid) || null;
    }
    if (!storeData && allStores.length > 0) {
        storeData = allStores[0];
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

        if (!countRes.error) {
            bookingsCount = countRes.count || 0;
        }

        // Fetch orders count for CTR calculation
        const ordersRes = await supabase
            .from('orders' as any)
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeData.id);

        const ordersCount = ordersRes.count || 0;

        // Fetch Analytics Data
        const { data: analyticsData } = await (supabase as any)
            .from('store_analytics')
            .select('user_id, session_id, type, created_at')
            .eq('store_id', storeData.id);

        // Calculate Advanced Metrics
        let avgSessionTime = 0;
        let returnVisitorsCount = 0;
        let uniqueSessionsCount = 0;
        let totalPhotoViews = totalViews; // Base profile views

        if (analyticsData && analyticsData.length > 0) {
            const sessions: Record<string, { start: Date, end: Date, userId: string | null }> = {};
            const userHistory: Record<string, Set<string>> = {};

            analyticsData.forEach((a: any) => {
                const time = new Date(a.created_at);
                if (!sessions[a.session_id]) {
                    sessions[a.session_id] = { start: time, end: time, userId: a.user_id };
                } else {
                    if (time < sessions[a.session_id].start) sessions[a.session_id].start = time;
                    if (time > sessions[a.session_id].end) sessions[a.session_id].end = time;
                }

                if (a.user_id) {
                    if (!userHistory[a.user_id]) userHistory[a.user_id] = new Set();
                    userHistory[a.user_id].add(a.session_id);
                }

                if (a.type === 'view') {
                    totalPhotoViews++;
                }
            });

            const sessionDurations = Object.values(sessions).map(s =>
                (s.end.getTime() - s.start.getTime()) / 1000
            );

            uniqueSessionsCount = Object.keys(sessions).length;
            avgSessionTime = sessionDurations.length > 0
                ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
                : 0;

            returnVisitorsCount = Object.values(userHistory).filter(s => s.size > 1).length;
        }

        // Final Metrics Assembly
        const ctr = uniqueSessionsCount > 0
            ? ((bookingsCount + ordersCount) / uniqueSessionsCount) * 100
            : 0;

        return {
            user: {
                ...user,
                profile: userData,
                avatar: userData?.avatar_url || null,
                email: user.email,
                twoFactorEnabled: userData?.two_factor_enabled || false,
                emailNotificationsEnabled: userData?.email_notifications_enabled !== false, // Default true
                loginAlertsEnabled: userData?.login_alerts_enabled !== false, // Default true
            },
            store: storeData,
            stores: storesPayload,
            metrics: {
                reviewsCount,
                avgRating,
                totalViews, // Profil views
                totalPhotoViews, // Profil + Content views
                bookingsCount,
                ordersCount,
                ctr: Number(ctr.toFixed(1)),
                avgSessionTime: Math.round(avgSessionTime),
                returnVisitorsCount,
                uniqueSessionsCount
            },
            recentReviews,
        }
    }

    return {
        user: {
            ...user,
            profile: userData,
            avatar: userData?.avatar_url || null,
            email: user.email,
            twoFactorEnabled: userData?.two_factor_enabled || false,
            emailNotificationsEnabled: userData?.email_notifications_enabled !== false,
            loginAlertsEnabled: userData?.login_alerts_enabled !== false,
        },
        store: storeData,
        stores: storesPayload,
        metrics: {
            reviewsCount: 0,
            avgRating: 0,
            totalViews: 0,
            bookingsCount: 0,
            ordersCount: 0,
            ctr: 0,
            avgSessionTime: 0,
            returnVisitorsCount: 0,
            uniqueSessionsCount: 0
        },
        recentReviews: [],
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
    } else {
        console.log('[profile] Fetched user profile:', userData);
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

    // - Store follows (following)
    const { count: followingCount } = await (supabase
        .from('store_follows' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id) as any);

    // - Friends count (accepted friendships where user is either sender or receiver)
    const { data: friendsData, error: friendsError } = await (supabase
        .from('friendships' as any)
        .select(`
            *,
            sender:user_id (id, full_name, avatar_url, city),
            receiver:friend_id (id, full_name, avatar_url, city)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'ACCEPTED') as any);

    if (friendsError) {
        console.error("Error fetching friendships:", friendsError);
    }

    const friendsCount = (friendsData || []).length;
    const friends = (friendsData || []).map((f: any) => {
        const friend = f.user_id === user.id ? f.receiver : f.sender;
        return {
            id: friend.id,
            full_name: friend.full_name,
            avatar_url: friend.avatar_url,
            city: friend.city
        };
    });

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

    // 6.5 Fetch User's Followed Stores
    const { data: userFollowedStores, error: followsError } = await (supabase
        .from('store_follows' as any)
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
        .order('created_at', { ascending: false }) as any);

    if (followsError) {
        console.error("Error fetching user followed stores:", followsError)
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

    // 8. Fetch all owned stores (Matched by UID or Email)
    const { data: ownedStores } = await (supabase
        .from('stores' as any)
        .select('id, name, logo_url, status, email, owner_id')
        .or(`owner_id.eq.${user.id},email.eq.${user.email}`)
        .order('created_at', { ascending: true }) as any);

    const primaryStore = ownedStores && ownedStores.length > 0 ? ownedStores[0] : null;

    return {
        user: {
            ...user,
            profile: userData,
            avatar: userData?.avatar_url || null,
            email: user.email,
            ownedStoreId: primaryStore?.id || null,
            ownedStoreStatus: primaryStore?.status || null,
            ownedStores: ownedStores || [],
        },
        stats: {
            reviewsCount: reviewsCount || 0,
            bookingsCount: bookingsCount || 0,
            ordersCount: ordersCount || 0,
            savedCount: savedCount || 0,
            followingCount: followingCount || 0,
            friendsCount: friendsCount || 0,
            citiesCount: 1,
            helpfulVotes: 0,
        },
        friends: friends,
        followedStores: (userFollowedStores || []).map((s: any) => ({
            id: s.id.toString(),
            storeId: s.stores?.id,
            businessName: s.stores?.name || 'Unknown Business',
            businessImage: s.stores?.logo_url || '/placeholder-business.svg',
            businessCategory: s.stores?.category || 'General',
            address: s.stores?.address || '',
            rating: s.stores?.rating_average || 0,
            date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        })),
        savedPlaces: (userSavedPlaces || []).map((s: any) => ({
            id: s.id.toString(),
            storeId: s.stores?.id,
            businessName: s.stores?.name || 'Unknown Business',
            businessImage: s.stores?.logo_url || '/placeholder-business.svg',
            businessCategory: s.stores?.category || 'General',
            address: s.stores?.address || '',
            rating: s.stores?.rating_average || 0,
            date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        })),
        reviews: (userReviews || []).map((r: any) => ({
            id: r.id.toString(),
            businessName: r.stores?.name || 'Unknown Business',
            businessImage: r.stores?.logo_url || '/placeholder-business.svg',
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
            tracking_code: o.tracking_code,
            date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        })),
        bookings: userBookings || [],
        activity: sortedActivity,
    }
}

/**
 * Updates the user's profile image (avatar).
 */
export async function updateUserAvatar(formData: FormData) {
    const supabase = createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'You must be logged in to update your profile.' }
    }

    const file = formData.get('avatar') as File
    if (!file || file.size === 0) {
        return { error: 'No image provided.' }
    }

    // 2. Upload to Storage
    // We use the 'store-images' bucket as it's already configured for public access
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        })

    if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: 'Failed to upload image.' }
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('store-images')
        .getPublicUrl(uploadData.path)

    // 4. Update Database (public.users table)
    const { error: updateError } = await supabase
        .from('users' as any)
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

    if (updateError) {
        console.error('DB Update error:', updateError)
        return { error: 'Failed to update profile data.' }
    }

    // 5. Update Auth Metadata (optional but good for consistency)
    await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
    })

    // 6. Revalidate
    revalidatePath('/', 'layout')
    revalidatePath('/profile')

    return { success: true, avatarUrl: publicUrl }
}
