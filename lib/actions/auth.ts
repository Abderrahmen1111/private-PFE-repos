'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { rateLimit, getClientIp, formatRetryAfter } from '@/lib/rate-limit'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ActionResult =
  | { success: true; message?: string }
  | { error: string }

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function validateOrigin(): boolean {
  const headersList = headers()
  const origin = headersList.get('origin')
  const host = headersList.get('host')
  if (!origin || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Get the client IP from server action headers.
 */
function getIpFromHeaders(): string {
  const headersList = headers()
  return (
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

async function getRoleFromDB(userId: string): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: string }>()
  return data?.role ?? 'client'
}

function redirectPathForRole(role: string): string {
  if (role === 'admin') return '/admin/dashboard'
  return '/'
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────

export async function login(formData: FormData): Promise<ActionResult> {
  if (!validateOrigin()) return { error: 'Invalid request origin.' }

  // Rate limit par IP — double protection avec le middleware
  const ip = getIpFromHeaders()
  const rl = await rateLimit('login', ip)
  if (!rl.success) {
    return {
      error: `Too many login attempts. Please try again in ${formatRetryAfter(rl.resetAt)}.`,
    }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = createClient()
  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[auth] login error:', error.message)
    return { error: 'Invalid email or password.' }
  }

  if (!authData.user) return { error: 'Authentication failed. Please try again.' }

  const role = await getRoleFromDB(authData.user.id)
  revalidatePath('/', 'layout')
  redirect(redirectPathForRole(role))
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────────────────────

export async function signup(formData: FormData): Promise<ActionResult> {
  if (!validateOrigin()) return { error: 'Invalid request origin.' }

  const ip = getIpFromHeaders()
  const rl = await rateLimit('signup', ip)
  if (!rl.success) {
    return {
      error: `Too many signup attempts. Please try again in ${formatRetryAfter(rl.resetAt)}.`,
    }
  }

  const fullName = (formData.get('fullName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!fullName || !email || !password) return { error: 'All fields are required.' }
  if (password !== confirmPassword) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = createClient()
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    console.error('[auth] signup error:', error.message)
    return { error: 'Unable to create account. Please try again or contact support.' }
  }

  if (!authData.user?.identities?.length) {
    return { error: 'An account with this email already exists. Please log in instead.' }
  }

  return {
    success: true,
    message: 'Account created! Please check your email to confirm your account before logging in.',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC LINK — LOGIN
// ─────────────────────────────────────────────────────────────────────────────

export async function sendLoginMagicLink(formData: FormData): Promise<ActionResult> {
  if (!validateOrigin()) return { error: 'Invalid request origin.' }

  const ip = getIpFromHeaders()
  const rl = await rateLimit('magicLink', ip)
  if (!rl.success) {
    return {
      error: `Too many requests. Please try again in ${formatRetryAfter(rl.resetAt)}.`,
    }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Email is required.' }

  const supabase = createClient()
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) console.error('[auth] magic link error:', error.message)

  // Toujours retourner succès — anti-énumération
  return {
    success: true,
    message: 'If an account exists, a login link has been sent to your email.',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC LINK — SIGNUP
// ─────────────────────────────────────────────────────────────────────────────

export async function sendSignupMagicLink(formData: FormData): Promise<ActionResult> {
  if (!validateOrigin()) return { error: 'Invalid request origin.' }

  const ip = getIpFromHeaders()
  const rl = await rateLimit('magicLink', ip)
  if (!rl.success) {
    return {
      error: `Too many requests. Please try again in ${formatRetryAfter(rl.resetAt)}.`,
    }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const fullName = (formData.get('fullName') as string)?.trim()
  if (!email || !fullName) return { error: 'Email and full name are required.' }

  const supabase = createClient()
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) console.error('[auth] signup magic link error:', error.message)

  return {
    success: true,
    message: 'Check your email — a signup link has been sent.',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────────────────────

export async function signout(): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) console.error('[auth] signout error:', error.message)
  revalidatePath('/', 'layout')
  redirect('/')
}