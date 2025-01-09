// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const region = searchParams.get('region')?.toLowerCase() || 'na1';

    const RIOT_API_KEY = process.env.RIOT_API_KEY;

    // Debug logging
    console.log('API Key exists:', !!RIOT_API_KEY);
    console.log('API Key starts with:', RIOT_API_KEY?.substring(0, 7));
    console.log('Request URL:', `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`);

    // First, let's try to make a test response to verify our environment
    return NextResponse.json({
      debug: {
        hasApiKey: !!RIOT_API_KEY,
        apiKeyPrefix: RIOT_API_KEY?.substring(0, 7),
        requestedSummoner: summonerName,
        requestedRegion: region,
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}