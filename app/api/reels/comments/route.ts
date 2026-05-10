import { NextResponse } from 'next/server'
import { getReelComments, postReelComment } from '@/lib/actions/comments'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reelId = searchParams.get('reelId')

  if (!reelId) {
    return NextResponse.json({ error: 'reelId is required' }, { status: 400 })
  }

  try {
    const comments = await getReelComments(parseInt(reelId))
    return NextResponse.json(comments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reelId, content } = body

    if (!reelId || !content) {
      return NextResponse.json({ error: 'reelId and content are required' }, { status: 400 })
    }

    const result = await postReelComment({
      reelId: parseInt(reelId),
      content
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
