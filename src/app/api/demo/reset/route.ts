import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    await db.resetDemoData();
    return NextResponse.json({
      success: true,
      message: 'Demo dataset has been successfully reset to initial seed state.'
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

