import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RequestLog from '@/models/RequestLog';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    await RequestLog.create(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to log request' },
      { status: 500 }
    );
  }
}
