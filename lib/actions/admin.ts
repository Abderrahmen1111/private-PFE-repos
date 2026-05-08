'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Récupère les statistiques globales pour la plateforme d'administration.
 * Nécessite un rôle ADMIN.
 */
export async function getGlobalAdminStats() {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // 1. Vérifier si l'utilisateur actuel est admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'ADMIN') {
        throw new Error('Accès refusé : Droits administrateur requis')
    }

    // 2. Récupérer les métriques globales
    const [
        { count: totalUsers },
        { count: totalStores },
        { count: totalOrders },
        { count: totalBookings },
        { data: totalRevenueRes }
    ] = await Promise.all([
        adminSupabase.from('users').select('*', { count: 'exact', head: true }),
        adminSupabase.from('stores').select('*', { count: 'exact', head: true }),
        adminSupabase.from('orders').select('*', { count: 'exact', head: true }),
        adminSupabase.from('bookings').select('*', { count: 'exact', head: true }),
        adminSupabase.from('transactions').select('amount').eq('status', 'completed')
    ])

    const totalRevenue = (totalRevenueRes || []).reduce((sum, t) => sum + (t.amount || 0), 0)

    // 3. Récupérer les 5 dernières boutiques en attente de validation
    const { data: pendingStores } = await adminSupabase
        .from('stores')
        .select('id, name, created_at, status')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(5)

    return {
        metrics: {
            users: totalUsers || 0,
            stores: totalStores || 0,
            orders: totalOrders || 0,
            bookings: totalBookings || 0,
            revenue: totalRevenue
        },
        pendingStores: pendingStores || []
    }
}

/**
 * Valide ou rejette une boutique (KYC)
 */
export async function updateStoreStatus(storeId: number, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    const adminSupabase = createAdminClient()
    
    const { data, error } = await adminSupabase
        .from('stores')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', storeId)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}
