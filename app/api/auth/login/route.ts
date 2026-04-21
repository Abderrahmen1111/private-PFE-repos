export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Fetch user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single<{ role: string }>()

    if (profileError) {
      console.error('[auth/login] Error fetching profile:', profileError.message)
    }

    const role = profile?.role || 'client'
    let redirectUrl = '/'
    
    console.log('[auth/login] User ID:', data.user.id, '| Role:', role);

    if (role === 'admin') {
      redirectUrl = '/admin/dashboard'
    } else if (role.toLowerCase() === 'pro' || role.toLowerCase() === 'business_owner' || role.toLowerCase() === 'business owner') {
      const { data: store, error: storeError } = await (supabase
        .from('stores')
        .select('id')
        .eq('owner_id', data.user.id)
        .limit(1)
        .maybeSingle() as any)

      if (storeError) {
        console.error('[auth/login] Error fetching store:', storeError.message)
      }
      
      console.log('[auth/login] Store data:', store);

      if (store) {
        redirectUrl = `/dashboard/${store.id}`
      } else {
        redirectUrl = '/merchants/business/add'
      }
    }

    console.log('[auth/login] Computed redirectUrl:', redirectUrl);

    return NextResponse.json(
      { 
        user: data.user,
        message: 'Successfully logged in',
        redirectUrl
      }, 
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
