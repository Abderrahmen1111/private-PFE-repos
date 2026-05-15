import { NextResponse } from 'next/server'
import { getBusinessStories, getDiscoverStories } from '@/lib/actions/stories'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    if (storeId) {
      const stories = await getBusinessStories(parseInt(storeId))
      return NextResponse.json(stories)
    }

    const stories = await getDiscoverStories(limit)
    return NextResponse.json(stories)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
