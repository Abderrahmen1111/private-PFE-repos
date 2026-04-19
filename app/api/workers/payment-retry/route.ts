import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function handler(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: order } = await supabaseAdmin.from('orders').select('id, status').eq('id', orderId).single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Logic: check order status
    if (order.status !== 'VALIDATED' && order.status !== 'COMPLETED') {
        // e.g. Perform an asynchronous check with your Payment Provider
        // Throwing an error forces QStash to retry based on its retry schedule
        throw new Error('Payment not yet confirmed. Retrying...');
    }

    return NextResponse.json({ success: true, message: 'Payment confirmed' }, { status: 200 });
  } catch (err: any) {
    console.error('Payment retry logic failed:', err);
    // 500 status triggers automatic QStash retry mechanism
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// verifySignatureAppRouter wraps the handler to ensure requests only come from Upstash
export const POST = verifySignatureAppRouter(handler);
