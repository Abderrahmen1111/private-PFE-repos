import { NextResponse } from 'next/server';
import { getFriendSuggestions } from '@/lib/suggestions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    
    const suggestions = await getFriendSuggestions(q);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('[API] Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des suggestions' }, { status: 500 });
  }
}
