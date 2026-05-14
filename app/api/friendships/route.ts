import { NextResponse } from 'next/server';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  unsendFriendRequest, 
  declineFriendRequest,
  blockUser,
  unblockUser 
} from '@/lib/actions/friendships';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, targetId } = body;

    if (!targetId) {
      return NextResponse.json({ error: 'targetId manquant' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'send':
        result = await sendFriendRequest(targetId);
        break;
      case 'accept':
        result = await acceptFriendRequest(targetId);
        break;
      case 'cancel':
        result = await unsendFriendRequest(targetId);
        break;
      case 'decline':
        result = await declineFriendRequest(targetId);
        break;
      case 'block':
        result = await blockUser(targetId);
        break;
      case 'unblock':
        result = await unblockUser(targetId);
        break;
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: 'data' in result ? result.data : null });
  } catch (error: any) {
    console.error('[API Friendships] Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
