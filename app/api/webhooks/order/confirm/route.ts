export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncOrderTransaction } from '@/lib/actions/transactions';

export async function POST(request: Request) {
  try {
    // 1. Basic security check (highly recommended for webhooks)
    const authHeader = request.headers.get('authorization');
    if (process.env.WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the payload
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 3. Initialize Admin Client to bypass RLS since webhooks don't have user cookies
    const supabaseAdmin = createAdminClient();

    // 4. Update the order manually as if it was validated
    const trackingCode = `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const { data: order, error } = await (supabaseAdmin
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

    if (error || !order) {
      return NextResponse.json({ error: error?.message || 'Failed to confirm order' }, { status: 400 });
    }

    // 5. Synchronize the transaction using the admin client
    await syncOrderTransaction(order, supabaseAdmin);

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook confirm order error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
