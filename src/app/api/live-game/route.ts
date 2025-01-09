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

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim(); // Trim any whitespace

    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      return NextResponse.json({
        error: 'API key format invalid',
        keyDetails: {
          hasKey: !!RIOT_API_KEY,
          startsWithRGAPI: RIOT_API_KEY?.startsWith('RGAPI-'),
          length: RIOT_API_KEY?.length
        }
      }, { status: 500 });
    }

    // Use exactly the same format as Postman
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
        'Accept': 'application/json'
      }
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      return NextResponse.json({
        error: `API Response: ${response.status}`,
        details: {
          url: url,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          response: responseData,
          keyInfo: {
            hasKey: !!RIOT_API_KEY,
            startsWithRGAPI: RIOT_API_KEY.startsWith('RGAPI-'),
            length: RIOT_API_KEY.length
          }
        }
      }, { status: response.status });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}