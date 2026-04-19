import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkAdminAuth } from '@/lib/admin-auth';
import { syncOrderTransaction } from '@/lib/actions/transactions';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = checkAdminAuth(request);
  if (authError) return authError;

  try {
    const orderId = Number(params.id);
    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID format in URL' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['PENDING', 'VALIDATED', 'SHIPPED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: `Invalid status parameter passed: ${status}` }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'VALIDATED') updateData.validated_at = new Date().toISOString();
    if (status === 'COMPLETED') updateData.completed_at = new Date().toISOString();

    const { data, error } = await (supabaseAdmin
      .from('orders') as any)
      .update(updateData)
      .eq('id', orderId)
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
