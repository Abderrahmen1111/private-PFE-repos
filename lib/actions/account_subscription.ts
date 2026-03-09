'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetch active subscription for a user
 */
export async function getUserSubscription(userId: string) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching subscription:', error)
        return { error: error.message }
    }

    return { data }
}

/**
 * Update or create a subscription plan
 */
export async function updateSubscriptionPlan(userId: string, planName: string, price: number) {
    const supabase = createClient() as any

    const startDate = new Date().toISOString()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30) // Default 30 days period

    const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_name: planName,
            price: price,
            current_period_start: startDate,
            current_period_end: endDate.toISOString(),
            status: 'ACTIVE',
            auto_renew: true,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
        .select()
        .single()

    if (error) {
        console.error('Error updating subscription:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { data }
}

/**
 * Cancel auto-renewal of a subscription
 */
export async function cancelSubscription(userId: string) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('subscriptions')
        .update({
            auto_renew: false,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

    if (error) {
        console.error('Error cancelling subscription:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
}

/**
 * Get usage stats for account limits
 */
export async function getAccountUsageStats(userId: string) {
    const supabase = createClient() as any

    // 1. Get all stores owned by user
    const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', userId)

    if (storesError) {
        console.error('Error fetching stores for usage:', storesError)
        return { error: storesError.message }
    }

    const storeIds = stores?.map((s: any) => s.id) || []

    if (storeIds.length === 0) {
        return {
            data: {
                storeCount: 0,
                itemCount: 0,
                promoCount: 0
            }
        }
    }

    // 2. Count items and promotions across all stores
    const [itemsResult, promosResult] = await Promise.all([
        supabase
            .from('items')
            .select('id', { count: 'exact', head: true })
            .in('store_id', storeIds),
        supabase
            .from('promotions')
            .select('id', { count: 'exact', head: true })
            .in('store_id', storeIds)
    ])

    return {
        data: {
            storeCount: storeIds.length,
            itemCount: itemsResult.count || 0,
            promoCount: promosResult.count || 0
        }
    }
}

import { cookies } from 'next/headers'

/**
 * Permanently delete the user account
 */
export async function deleteAccount(userId: string) {
    const supabase = createClient() as any

    // Call the RPC function that handles recursive deletion in the database
    const { error } = await supabase.rpc('delete_user_account', { user_id: userId })

    if (error) {
        console.error('Error deleting account:', error)
        return { error: error.message }
    }

    // Clear session cookie
    cookies().delete('userId')

    return { success: true }
}
