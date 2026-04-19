import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET(request: Request) {
  // 1. Verify API Key
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const supabaseAdmin = createAdminClient();
    
    // Check parameters (e.g., limit, status)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 1000;
    const status = searchParams.get('status');

    let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(limit);

    if (status) {
      query = query.eq('status', status as any);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
