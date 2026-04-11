'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Log a user's search query to the database for recommendation purposes.
 * This is called whenever a user performs a search.
 */
export async function logUserSearch(query: string) {
    if (!query || query.trim().length === 0) return;
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // We only log searches for authenticated users to personalize their experience
    if (!user) return;

    const { error } = await (supabase as any)
        .from('user_search_history')
        .insert({
            user_id: user.id,
            query: query.trim().toLowerCase()
        });

    if (error) {
        console.error('Error logging user search:', error);
    }
}

/**
 * Log a store analytics event (view, heartbeat, click).
 */
export async function logStoreAnalyticsEvent(storeId: number, type: string, sessionId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await (supabase as any)
        .from('store_analytics')
        .insert({
            store_id: storeId,
            user_id: user?.id || null,
            session_id: sessionId,
            type: type
        });

    if (error) {
        console.error(`Error logging ${type} for store ${storeId}:`, error);
        return { error: error.message };
    }

    return { success: true };
}
