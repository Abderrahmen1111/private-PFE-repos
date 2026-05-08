import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * PROTECTED ROUTE PREFIXES
 * Define which routes require authentication and which roles can access them.
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/dashboard': ['ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER', 'PRO', 'CLIENT'],
  '/account': ['ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER', 'PRO', 'CLIENT'],
  '/checkout': ['ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER', 'PRO', 'CLIENT'],
  '/orders': ['ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER', 'PRO', 'CLIENT'],
  '/messages': ['ADMIN', 'BUSINESS_OWNER', 'BUSINESS OWNER', 'PRO', 'CLIENT'],
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

  const pathname = request.nextUrl.pathname

  const isProtected = Object.keys(PROTECTED_ROUTES).some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  /**
   * OPTIMISATION DE PERFORMANCE :
   * 1. On utilise getUser() (qui interroge le serveur Auth) UNIQUEMENT pour les routes protégées.
   * 2. Pour les autres routes (API publiques, page d'accueil), getSession() lit juste le cookie JWT très rapidement.
   */
  let user = null
  let userError = null

  if (isProtected || isAuthRoute) {
    const { data: userData, error } = await supabase.auth.getUser()
    user = userData?.user
    userError = error
  } else {
    const { data: sessionData } = await supabase.auth.getSession()
    user = sessionData?.session?.user || null
  }

  // ── 1. UNAUTHENTICATED USER trying to access a protected route ──────────────
  if (isProtected && (!user || userError)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ── 2. AUTHENTICATED USER — fetch role from DB (ONLY FOR PROTECTED ROUTES) ──
  // Évite une requête SQL inutile sur chaque page publique ou appel API.
  if (user && isProtected) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // If we can't read the profile, treat as unauthenticated for protected routes
    if (profileError || !profile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const userRole = profile.role as string

    // ── 3. ROLE-BASED ACCESS CONTROL on every request ───────────────────────
    for (const [prefix, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      const normalizedUserRole = userRole.toUpperCase()
      const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase())

      if (pathname.startsWith(prefix) && !normalizedAllowedRoles.includes(normalizedUserRole)) {
        // Redirect to appropriate fallback based on role
        const fallback = normalizedUserRole === 'ADMIN' ? '/admin/dashboard' : '/'
        return NextResponse.redirect(new URL(fallback, request.url))
      }
    }
    
    // Pass role as header for Server Components 
    response.headers.set('x-user-role', userRole)
  }

  // ── 4. AUTHENTICATED USER trying to access auth routes ───────────────────
  if (user && isAuthRoute) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
    // Validate redirectTo to prevent open redirect attacks
    const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/'
    return NextResponse.redirect(new URL(safeRedirect, request.url))
  }

  if (user) {
    response.headers.set('x-user-id', user.id)
  }

  return response
}