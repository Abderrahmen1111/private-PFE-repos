import { updateSession } from '@/lib/supabase/middleware'
import { rateLimit, getClientIp, formatRetryAfter } from '@/lib/rate-limit'
import { NextResponse, type NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES SOUMISES AU RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

const RATE_LIMITED_ROUTES = [
  { path: '/api/auth/login',      action: 'login'     },
  { path: '/api/auth/signup',     action: 'signup'    },
  { path: '/api/auth/magic-link', action: 'magicLink' },
  // Les Server Actions passent par POST sur la page /login
  // On rate-limite donc /login (POST) pour couvrir toutes les actions auth
  { path: '/login',               action: 'login'     },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  const ip = getClientIp(request)

  // ── Rate limiting — POST uniquement (GET = navigation, pas d'action auth) ──
  if (method === 'POST') {
    const matchedRoute = RATE_LIMITED_ROUTES.find((r) =>
      pathname.startsWith(r.path)
    )

    if (matchedRoute) {
      const result = await rateLimit(matchedRoute.action, ip)

      if (!result.success) {
        const retryAfter = formatRetryAfter(result.resetAt)
        const retrySeconds = Math.ceil((result.resetAt - Date.now()) / 1000)

        // Réponse JSON pour les appels API directs
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              error: `Too many attempts. Please try again in ${retryAfter}.`,
              retryAfter: retrySeconds,
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(retrySeconds),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
              },
            }
          )
        }

        // Pour les Server Actions sur /login — redirect avec param d'erreur
        // Le composant AuthCard lit ce param et affiche le message
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'too_many_attempts')
        url.searchParams.set('retry_after', retryAfter)
        return NextResponse.redirect(url)
      }

      // Requête autorisée — continuer avec la session Supabase
      // + ajouter les headers informatifs de rate limit
      const response = await updateSession(request)
      response.headers.set('X-RateLimit-Limit', String(result.limit))
      response.headers.set('X-RateLimit-Remaining', String(result.remaining))
      response.headers.set(
        'X-RateLimit-Reset',
        String(Math.ceil(result.resetAt / 1000))
      )
      return response
    }
  }

  // ── Toutes les autres routes — session Supabase uniquement ────────────────
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}