import { NextResponse } from 'next/server';
import { 
  toggleFollowStore, 
  isFollowingStore, 
  getUserFollowedStores 
} from '@/lib/actions/store-follows';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');

  try {
    if (storeId) {
      const followed = await isFollowingStore(parseInt(storeId));
      return NextResponse.json({ followed });
    }

    const followedStores = await getUserFollowedStores();
    return NextResponse.json(followedStores);
  } catch (error: any) {
    console.error('[API Store Follow] GET Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, action } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'storeId manquant' }, { status: 400 });
    }

    // Since we're using toggleFollowStore, action is mostly for clarity or if we want to force a state
    // But for now, we'll just use the toggle logic
    const result = await toggleFollowStore(storeId);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API Store Follow] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
