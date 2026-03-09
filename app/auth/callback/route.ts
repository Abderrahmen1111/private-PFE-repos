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
            const userId = data.user.id

            let redirectUrl = `${origin}/`
            if (role === 'admin') {
                redirectUrl = `${origin}/admin/dashboard`
            }

            const response = NextResponse.redirect(redirectUrl)

            // Set userId cookie
            response.cookies.set('userId', userId, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            return response
        }
    }

    // If something went wrong, redirect to login with an error
    return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}