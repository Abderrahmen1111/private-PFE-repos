export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as any
  const next = requestUrl.searchParams.get('next') ?? '/'
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  } else if (tokenHash && type) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type,
    })
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Could+not+authenticate+user`)
}
