import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * PROTECTED ROUTE PREFIXES
 * Define which routes require authentication and which roles can access them.
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/dashboard': ['admin', 'business_owner', 'PRO', 'client'],
  '/account': ['admin', 'business_owner', 'PRO', 'client'],
  '/checkout': ['admin', 'business_owner', 'PRO', 'client'],
  '/orders': ['admin', 'business_owner', 'PRO', 'client'],
  '/messages': ['admin', 'business_owner', 'PRO', 'client'],
}

const AUTH_ROUTES = ['/login', '/signup', '/auth']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  /**
   * SECURITY: Always use getUser() — it verifies the token with Supabase servers.
   * Never use getSession() alone in middleware — it only reads the cookie (spoofable).
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── 1. UNAUTHENTICATED USER trying to access a protected route ──────────────
  const isProtected = Object.keys(PROTECTED_ROUTES).some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtected && (!user || userError)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ── 2. AUTHENTICATED USER — fetch role from DB (never trust user_metadata) ──
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If we can't read the profile, treat as unauthenticated for protected routes
    if (profileError || !profile) {
      if (isProtected) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return response
    }

    const userRole = profile.role as string

    // ── 3. ROLE-BASED ACCESS CONTROL on every request ───────────────────────
    for (const [prefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(prefix) && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate fallback based on role
        const fallback = userRole === 'admin' ? '/admin/dashboard' : '/'
        return NextResponse.redirect(new URL(fallback, request.url))
      }
    }

    // ── 4. AUTHENTICATED USER trying to access auth routes ───────────────────
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
    if (isAuthRoute) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      // Validate redirectTo to prevent open redirect attacks
      const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/'
      return NextResponse.redirect(new URL(safeRedirect, request.url))
    }

    // ── 5. Pass role as header for Server Components (optional but useful) ───
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-id', user.id)
  }

  return response
}