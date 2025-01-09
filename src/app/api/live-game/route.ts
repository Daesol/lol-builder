// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

// Region routing map
const REGION_ROUTES = {
  'NA1': 'americas',
  'EUW1': 'europe',
  'KR': 'asia',
  'EUN1': 'europe',
  // Add more regions as needed
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const region = (searchParams.get('region') || 'NA1').toUpperCase();

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();

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

    // Use the platform routing (na1, euw1, etc.) for the API call
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    
    console.log('Making request to:', url);

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