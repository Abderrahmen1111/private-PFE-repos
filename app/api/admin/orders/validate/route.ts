import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';
import { syncOrderTransaction } from '@/lib/actions/transactions';

export async function POST(request: Request) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Generate tracking code
    const trackingCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const { data, error } = await (supabaseAdmin
      .from('orders') as any)
      .update({
        status: 'VALIDATED',
        tracking_code: trackingCode,
        validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(orderId))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) {
      await syncOrderTransaction(data, supabaseAdmin);
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    console.error('Validate order error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
