import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const role = data.user.user_metadata?.role || 'client'

            if (role === 'admin') {
                return NextResponse.redirect(`${origin}/admin/dashboard`)
            } else if (role === 'business_owner' || role === 'PRO') {
                return NextResponse.redirect(`${origin}/`)
            } else {
                return NextResponse.redirect(`${origin}/`)
            }
        }
    }

    // If something went wrong, redirect to login with an error
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}