import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPersonalizedReels } from '@/lib/actions/recommendations'
import { getBusinessReels, trackReelInteraction } from '@/lib/actions/reels'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')

  try {
    if (storeId) {
      const data = await getBusinessReels(parseInt(storeId))
      return NextResponse.json(data)
    }

    const data = await getPersonalizedReels()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { reelId, type } = await request.json()
    
    if (!reelId || !type) {
      return NextResponse.json({ error: 'reelId and type are required' }, { status: 400 })
    }

    const result = await trackReelInteraction(reelId, type)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
