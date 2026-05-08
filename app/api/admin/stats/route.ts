import { NextRequest, NextResponse } from 'next/server'
import { getGlobalAdminStats } from '@/lib/actions/admin'
import { checkAdminAuth } from '@/lib/admin-auth'

export const runtime = 'nodejs'

/**
 * GET /api/admin/stats
 * Retourne les statistiques globales de la plateforme Ro2ya.
 * Sécurisé par API Key (pour services externes/mobile admin) ou session admin.
 */
export async function GET(req: NextRequest) {
    // 1. Vérification de l'authentification (API Key ou Session)
    const authError = checkAdminAuth(req)
    if (authError) {
        // Si pas d'API Key, on tente via la session Server Action (qui vérifie le rôle en interne)
        try {
            const stats = await getGlobalAdminStats()
            return NextResponse.json({ success: true, data: stats })
        } catch (err: any) {
            return NextResponse.json({ 
                success: false, 
                error: { code: 'UNAUTHORIZED', message: err.message } 
            }, { status: 401 })
        }
    }

    // 2. Si authentifié par API Key, on récupère les stats
    try {
        const stats = await getGlobalAdminStats()
        return NextResponse.json({ success: true, data: stats })
    } catch (err: any) {
        return NextResponse.json({ 
            success: false, 
            error: { code: 'INTERNAL_ERROR', message: err.message } 
        }, { status: 500 })
    }
}
