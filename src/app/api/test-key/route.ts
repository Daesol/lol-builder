// src/app/api/test-key/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  
  return NextResponse.json({
    hasKey: !!RIOT_API_KEY,
    keyPrefix: RIOT_API_KEY?.substring(0, 7),
    keyLength: RIOT_API_KEY?.length
  });
}