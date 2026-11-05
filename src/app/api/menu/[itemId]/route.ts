import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await context.params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      updates.price = p;
    }
    if (body.is_available !== undefined) {
      updates.is_available = Boolean(body.is_available);
    }
    if (body.name !== undefined) {
      updates.name = String(body.name).trim();
    }
    if (body.description !== undefined) {
      updates.description = String(body.description).trim();
    }
    if (body.category_id !== undefined) {
      updates.category_id = String(body.category_id);
    }
    if (body.is_veg !== undefined) {
      updates.is_veg = Boolean(body.is_veg);
    }
    if (body.image_url !== undefined) {
      updates.image_url = String(body.image_url).trim();
    }

    const updated = await db.updateMenuItem(itemId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await context.params;
    const deleted = await db.deleteMenuItem(itemId);

    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

