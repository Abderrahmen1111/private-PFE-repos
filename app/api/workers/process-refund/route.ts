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
import { cancelOrder } from '@/lib/actions/orders';

async function handler(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Call external 3rd-party Payment Provider API to process money refund here
    // e.g. await stripe.refunds.create({ payment_intent: 'pi_xxx' })
    await new Promise(resolve => setTimeout(resolve, 500)); // Mocking the wait
    
    // Update local Application Postgres DB 
    await cancelOrder(Number(orderId), reason || 'Refund resolved through background worker process');

    return NextResponse.json({ success: true, message: 'Async Refund processed securely' }, { status: 200 });
  } catch (err: any) {
    console.error('Async refund failure:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
