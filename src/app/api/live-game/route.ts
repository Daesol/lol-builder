// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const region = searchParams.get('region')?.toLowerCase() || 'na1';

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY;

    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      return NextResponse.json(
        { error: 'API key not properly configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      {
        method: 'GET',
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: `API Response: ${response.status} - ${errorText}`,
          details: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText
          }
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}