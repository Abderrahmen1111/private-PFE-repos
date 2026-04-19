export const dynamic = 'force-dynamic'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

// Fallback for build time if QStash keys are missing
if (!process.env.QSTASH_CURRENT_SIGNING_KEY) {
  process.env.QSTASH_CURRENT_SIGNING_KEY = 'dummy_key_for_build';
}
if (!process.env.QSTASH_NEXT_SIGNING_KEY) {
  process.env.QSTASH_NEXT_SIGNING_KEY = 'dummy_key_for_build';
}
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
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const externalApi = process.env.EXTERNAL_API_URL;
    if (!externalApi) {
       console.warn('EXTERNAL_API_URL is not set. Mocking sync resolution...');
       return NextResponse.json({ success: true, mocked: true });
    }

    // Perform external call (ERP, accounting tool, shipping platform)
    const response = await fetch(externalApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        order_reference: order.order_number, 
        customer_id: order.customer_id,
        items: (order as any).cart,
        status: order.status
      }),
    });

    if (!response.ok) {
       // Throws an error to force a QStash retry incase the external API experiences downtime
       throw new Error(`External system sync failed with status ${response.status}`);
    }

    return NextResponse.json({ success: true, message: 'Order successfully synced' }, { status: 200 });
  } catch (err: any) {
    console.error('Order sync failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
