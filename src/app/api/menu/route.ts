import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id');

    if (!cafeId) {
      return NextResponse.json({ error: 'cafe_id query parameter is required' }, { status: 400 });
    }

    const items = await db.getMenuItems(cafeId);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.cafe_id || !body.name?.trim() || body.price === undefined) {
      return NextResponse.json({ error: 'cafe_id, name, and price are required' }, { status: 400 });
    }

    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    const newItem = await db.createMenuItem({
      cafe_id: body.cafe_id,
      category_id: body.category_id || '',
      name: body.name.trim(),
      description: body.description?.trim() || '',
      price,
      image_url: body.image_url?.trim() || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
      is_available: body.is_available !== false,
      is_veg: body.is_veg !== false,
      is_featured: Boolean(body.is_featured),
      preparation_time_minutes: Number(body.preparation_time_minutes) || 10,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

