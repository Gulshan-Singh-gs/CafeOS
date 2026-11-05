import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderSubmissionPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: OrderSubmissionPayload = await req.json();

    if (!body.cafe_id) {
      return NextResponse.json({ error: 'Missing required field: cafe_id' }, { status: 400 });
    }
    if (!body.customer_name?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!body.customer_phone?.trim()) {
      return NextResponse.json({ error: 'Customer phone number is required' }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one item must be ordered' }, { status: 400 });
    }

    const order = await db.createOrder(body);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id');

    if (!cafeId) {
      return NextResponse.json({ error: 'cafe_id query parameter is required' }, { status: 400 });
    }

    // Tenant isolation: returns only orders belonging to cafeId
    const orders = await db.getOrders(cafeId);
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

