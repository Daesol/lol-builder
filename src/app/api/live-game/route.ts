// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine') || 'NA1'; // Get tagLine from query params
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

    // 1. First get Riot Account ID using name and tag
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    if (!accountResponse.ok) {
      return NextResponse.json({
        error: 'Account not found',
        details: await accountResponse.json()
      }, { status: accountResponse.status });
    }

    const accountData = await accountResponse.json();

    // 2. Get Summoner data using PUUID
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    if (!summonerResponse.ok) {
      return NextResponse.json({
        error: 'Summoner not found',
        details: await summonerResponse.json()
      }, { status: summonerResponse.status });
    }

    const summonerData = await summonerResponse.json();

    // 3. Try to get live game data
    const liveGameUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerData.id}`;
    const liveGameResponse = await fetch(liveGameUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    // If 404, player is not in game (this is normal)
    const liveGameData = liveGameResponse.status === 404 
      ? null 
      : await liveGameResponse.json();

    // Return all the data
    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData,
      message: liveGameData ? 'Player is in game' : 'Player is not in game'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}