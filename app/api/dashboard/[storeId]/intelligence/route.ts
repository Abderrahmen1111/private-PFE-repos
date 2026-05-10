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

    // 1. Get all reel IDs for this store first
    const { data: storeReels, error: reelsError } = await (supabase as any)
      .from('reels')
      .select('id')
      .eq('store_id', storeId)

    const reelIds = (storeReels || []).map((r: any) => r.id)
    console.log(`[Intelligence] Store ${storeId}: found ${reelIds.length} reels:`, reelIds)

    // 2. Fetch latest comments for these reels
    let comments: any[] = []
    let commentsError: any = null

    if (reelIds.length > 0) {
      const result = await (supabase as any)
        .from('reel_comments')
        .select('id, content, reel_id, user_id, created_at')
        .in('reel_id', reelIds)
        .order('created_at', { ascending: false })
        .limit(15)
      comments = result.data || []
      commentsError = result.error
      console.log(`[Intelligence] Found ${comments.length} comments for reels`, commentsError ? `ERROR: ${commentsError.message}` : '')
    }

    // 3. Fetch latest reviews for this store
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, comment, rating, author_id, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(15)

    console.log(`[Intelligence] Found ${reviews?.length || 0} reviews`, reviewsError ? `ERROR: ${reviewsError.message}` : '')

    if (commentsError || reviewsError || reelsError) {
      return NextResponse.json({ error: (commentsError || reviewsError || reelsError)?.message }, { status: 400 })
    }

    const allData = [
      ...(comments || []).map((c: any) => ({
        comment: c.content,
        reelId: c.reel_id,
        userId: c.user_id,
        type: 'COMMENT'
      })),
      ...(reviews || []).map((r: any) => ({
        comment: r.comment,
        rating: r.rating,
        userId: r.author_id,
        type: 'REVIEW'
      }))
    ];

    console.log(`[Intelligence] Total items to analyze: ${allData.length}`)

    if (allData.length === 0) {
      return NextResponse.json({ 
        message: "No data found to analyze",
        data: null 
      });
    }

    // 2. Format for analyzer
    const batchReq = {
      businessId: storeId.toString(),
      comments: allData
    };

    // 3. Analyze
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante dans l'environnement Vercel" }, { status: 500 });
    }

    try {
      const result = await analyzeBatch(batchReq, apiKey);
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("[Intelligence] Analysis Error:", err);
      return NextResponse.json({ 
        error: "L'IA n'a pas pu répondre", 
        details: err.message,
        code: err.statusCode || 500
      }, { status: 200 }); // Return 200 so the UI can show the message instead of just crashing
    }

  } catch (error: any) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
