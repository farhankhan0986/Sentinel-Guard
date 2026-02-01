import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FirewallRule from '@/models/FirewallRule';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const rule = await FirewallRule.create(body);

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}
