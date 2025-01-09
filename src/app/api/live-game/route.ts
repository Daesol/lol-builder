// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

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

    // Use regional routing for the API call
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${platform}`;
    
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

    // After getting the account info, get summoner details
    const puuid = responseData.puuid;
    const summonerUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    const summonerData = await summonerResponse.json();
    return NextResponse.json(summonerData);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}