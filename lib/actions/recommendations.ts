'use server'

import { createClient } from '@/lib/supabase/server'
import { DiscoverFeedItem } from '@/components/discover/feed-algorithm'

/**
 * Robust ranking algorithm for Reels.
 * Combines:
 * - User Preferences (Categories)
 * - User Interactions (Likes, Saves, Completions)
 * - City Match (User vs Store)
 * - Visit History
 * - Search History Keywords
 */
export async function getPersonalizedReels(): Promise<DiscoverFeedItem[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch User Data (Signals)
    let userCity = null;
    let preferredCategories: { category: string, score: number }[] = [];
    let recentInteractions: any[] = [];
    let searchHistory: string[] = [];

    if (user) {
        const [profileRes, prefsRes, interRes, searchRes] = await Promise.all([
            (supabase as any).from('users').select('city').eq('id', user.id).maybeSingle(),
            (supabase as any).from('user_preferences').select('category, score').eq('user_id', user.id),
            (supabase as any).from('user_interactions').select('reel_id, store_id, type').eq('user_id', user.id),
            (supabase as any).from('user_search_history').select('query').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
        ]);

        userCity = (profileRes.data as any)?.city;
        preferredCategories = prefsRes.data || [];
        recentInteractions = interRes.data || [];
        searchHistory = (searchRes.data || []).map((s: any) => s.query);
    }

    // 2. Fetch Reels with store details for scoring
    const { data: reelsData, error } = await (supabase as any)
        .from('reels')
        .select(`
            id,
            store_id,
            media_path,
            media_type,
            title,
            subtitle,
            price,
            currency,
            category,
            item_id,
            created_at,
            stores (
                id,
                name,
                city,
                category
            ),
            items:item_id (
                id,
                item_type
            ),
            reel_stats (
                views_count,
                likes_count
            )
        `)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching reels for recommendations:', error);
        return [];
    }

    const reelIds = reelsData.map((r: any) => r.id);

    // Fetch real global interactions directly to count exact likes and comments
    const [allInteractionsRes, allCommentsRes] = await Promise.all([
        (supabase as any).from('user_interactions').select('reel_id, type').in('reel_id', reelIds),
        (supabase as any).from('reel_comments').select('reel_id').in('reel_id', reelIds)
    ]);

    const globalInteractions = allInteractionsRes.data || [];
    const globalComments = allCommentsRes.data || [];

    // 3. Scoring Strategy
    const scoredReels = reelsData.map((reel: any) => {
        let personalScore = 0;
        const store = reel.stores || {};
        const stats = reel.reel_stats || {};

        // A. Category Preference (Max 50 pts)
        const pref = preferredCategories.find(p => p.category === (reel.category || store.category));
        if (pref) {
            personalScore += (pref.score * 50);
        }

        // B. City Match (40 pts)
        if (userCity && store.city && userCity.toLowerCase() === store.city.toLowerCase()) {
            personalScore += 40;
        }

        // C. Interaction History (30 pts)
        // Check if user interacted with this specific merchant before
        const interactedWithStore = recentInteractions.some(i => i.store_id === reel.store_id);
        if (interactedWithStore) {
            personalScore += 30;
        }

        // D. Search History Match (20 pts)
        if (searchHistory.length > 0) {
            const reelContent = `${reel.title} ${reel.subtitle} ${reel.category}`.toLowerCase();
            const matchesSearch = searchHistory.some(q => reelContent.includes(q));
            if (matchesSearch) {
                personalScore += 20;
            }
        }

        // E. Base Engagement (normalized popularity)
        const reelLikesCount = globalInteractions.filter((i: any) => i.reel_id === reel.id && i.type === 'like').length;
        const reelCommentsCount = globalComments.filter((c: any) => c.reel_id === reel.id).length;
        
        const totalEngagement = reelLikesCount + (stats.views_count || 0);
        const popularityScore = Math.min(100, Math.log10(totalEngagement + 1) * 20);

        return {
            id: `reel-${reel.id}`,
            merchantId: reel.store_id.toString(),
            merchantName: store.name || 'Merchant',
            product: reel.title,
            description: reel.subtitle || '',
            price: reel.price ? `${reel.price} ${reel.currency || 'TND'}` : '',
            image: parseFirstMediaPath(reel.media_path),
            allMedia: parseMediaUrls(reel.media_path),
            mediaType: reel.media_type,
            likes: reelLikesCount,
            comments: reelCommentsCount,
            hasLiked: recentInteractions.some(i => i.reel_id === reel.id && i.type === 'like'),
            hasSaved: recentInteractions.some(i => i.reel_id === reel.id && i.type === 'save'),
            category: (reel.category || store.category || 'lifestyle').toLowerCase(),
            popularityScore: popularityScore,
            engagementScore: personalScore, // We use engagementScore to represent personalization
            timestamp: new Date(reel.created_at).getTime(),
            merchant: {
                rating: 5.0,
                totalSales: 100,
                responseRate: 98
            },
            itemId: reel.item_id,
            itemType: reel.items?.item_type
        } as DiscoverFeedItem;
    });

    // 4. Sort and return
    return scoredReels.sort((a : any, b: any) => b.engagementScore - a.engagementScore);
}

function parseMediaUrls(path: string): string[] {
    if (!path) return [];
    if (path.startsWith('[') && path.endsWith(']')) {
        try {
            return JSON.parse(path);
        } catch (e) {
            return [path];
        }
    }
    return [path];
}

function parseFirstMediaPath(path: string): string {
    if (!path) return '';
    const urls = parseMediaUrls(path);
    return urls[0] || '';
}
