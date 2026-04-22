import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserProfileData } from '@/lib/actions/profile'
import { updateProfile } from '@/lib/actions/users'

export async function GET() {
  try {
    const data = await getUserProfileData()
    return NextResponse.json(data)
  } catch (error: any) {
    // If redirect was called (next/navigation), it throws an error that Next.js handles.
    // In an API route, we should handle it or return 401.
    return NextResponse.json({ error: 'Unauthorized or failed to fetch profile' }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const { data, error } = await updateProfile(user.id, updates)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, message: 'Profile updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
