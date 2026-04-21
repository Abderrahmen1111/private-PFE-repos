export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncOrderTransaction } from '@/lib/actions/transactions';

export async function POST(request: Request) {
  try {
    // 1. Basic security check
    const authHeader = request.headers.get('authorization');
    if (process.env.WEBHOOK_SECRET && authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 3. Admin client since this is an async system background job
    const supabaseAdmin = createAdminClient();

    // 4. Cancel the order explicitly representing a refund
    const refundReason = reason ? `[REFUND_WEBHOOK] ${reason}` : '[REFUND_WEBHOOK] Refund processed';

    const { data: order, error } = await (supabaseAdmin
      .from('orders') as any)
      .update({
        status: 'CANCELLED',
        vendor_notes: refundReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(orderId))
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ error: error?.message || 'Failed to refund order' }, { status: 400 });
    }

    // 5. Unsync / Update the transaction mapping
    await syncOrderTransaction(order, supabaseAdmin);

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook refund order error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
