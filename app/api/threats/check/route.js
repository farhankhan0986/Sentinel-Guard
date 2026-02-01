import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Threat from '@/models/Threat';

export async function GET(req) {
  await connectDB();

  const ip = req.nextUrl.searchParams.get('ip');
  if (!ip) {
    return NextResponse.json({ blocked: false });
  }

  const threat = await Threat.findOne({ ip });

  if (
    threat?.blockedUntil &&
    new Date(threat.blockedUntil) > new Date()
  ) {
    return NextResponse.json({ blocked: true });
  }

  return NextResponse.json({ blocked: false });
}
