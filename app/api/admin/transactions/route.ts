export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const supabaseAdmin = createAdminClient();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 500;
    const storeId = searchParams.get('storeId');

    let query = supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }).limit(limit);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    
    const { data: transactions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: transactions.length, data: transactions });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
