import { createClient } from '@/lib/supabase/server'
import { ensureUserExists } from '@/lib/actions/users'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * AUTH CALLBACK ROUTE
 *
 * Handles the OAuth / Magic Link redirect from Supabase.
 * Supabase sends the user here with a `code` param after they click a magic link
 * or complete an OAuth flow.
 *
 * Security measures:
 * - Validates the `code` param before exchanging
 * - Fetches role from the server-controlled `users` table (never user_metadata)
 * - Validates the `next` redirect param to prevent open redirect attacks
 * - Logs errors for monitoring (replace console.error with your logger)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // ── Validate the `next` param to prevent open redirect attacks ─────────────
  // Only allow relative paths that start with '/' and don't start with '//'
  function getSafeRedirect(next: string | null, fallback: string): string {
    if (!next) return fallback
    if (next.startsWith('/') && !next.startsWith('//')) return next
    return fallback
  }

  // ── No code param — invalid or expired link ─────────────────────────────────
  if (!code) {
    console.error('[auth/callback] No code param received')
    return NextResponse.redirect(
      new URL('/login?error=missing_code', origin)
    )
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error?.message)
    return NextResponse.redirect(
      new URL('/login?error=invalid_link', origin)
    )
  }

  // ── Ensure user exists in public.users table (safety net for trigger failures) ──
  const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
  const ensureResult = await ensureUserExists(data.user.id, data.user.email || '', fullName)
  if (ensureResult.error) {
    console.error('[auth/callback] Failed to ensure user exists:', ensureResult.error)
    // Continue anyway, as this might be a transient issue
  }

  // ── Fetch role from DB — never trust user_metadata ─────────────────────────
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single<{ role: string }>()

  if (profileError || !profile) {
    /**
     * Profile not found — this can happen briefly after signup if the DB trigger
     * hasn't fired yet. We still let the user in and redirect to '/',
     * the middleware will enforce access on the next request.
     */
    console.warn(
      '[auth/callback] User record not found for user:',
      data.user.id,
      profileError?.message
    )
    const safeNext = getSafeRedirect(next, '/')
    return NextResponse.redirect(new URL(safeNext, origin))
  }

  const role = profile.role as string

  // ── Determine redirect path based on role ──────────────────────────────────
  let defaultRedirect = '/'
  
  if (role?.toUpperCase() === 'ADMIN') {
    defaultRedirect = '/admin/dashboard'
  } else if (role?.toUpperCase() === 'PRO' || role?.toLowerCase() === 'business_owner' || role?.toLowerCase() === 'business owner') {
    const { data: store } = await (supabase
      .from('stores')
      .select('id')
      .eq('owner_id', data.user.id)
      .limit(1)
      .maybeSingle() as any)

    if (store) {
      defaultRedirect = `/dashboard/${store.id}`
    } else {
      defaultRedirect = '/merchants/business/add'
    }
  }

  // If a `next` param was passed (e.g. from a protected route redirect), use it.
  // Otherwise fall back to the role-based default.
  const redirectPath = getSafeRedirect(next, defaultRedirect)

  return NextResponse.redirect(new URL(redirectPath, origin))
}