import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeBatch } from '@/lib/actions/analyzer-service'

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const storeId = parseInt(params.storeId)
    if (isNaN(storeId)) return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 })

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Fetch latest comments for this store's reels
    const { data: comments, error: commentsError } = await (supabase
      .from('reel_comments' as any)
      .select(`
        id,
        content,
        reel_id,
        user_id,
        created_at,
        reels!inner(store_id)
      `)
      .eq('reels.store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(20) as any);

    if (commentsError) {
      return NextResponse.json({ error: commentsError.message }, { status: 400 });
    }

    if (!comments || comments.length === 0) {
      return NextResponse.json({ 
        message: "No comments found to analyze",
        data: null 
      });
    }

    // 2. Format for analyzer
    const batchReq = {
      businessId: storeId.toString(),
      comments: (comments as any[]).map((c: any) => ({
        comment: c.content,
        reelId: c.reel_id,
        userId: c.user_id,
      }))
    };

    // 3. Analyze
    const apiKey = process.env.OPENROUTER_API_KEY!;
    const result = await analyzeBatch(batchReq, apiKey);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
