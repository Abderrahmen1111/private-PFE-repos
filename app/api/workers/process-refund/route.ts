import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
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
