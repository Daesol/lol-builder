// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine')?.toUpperCase() || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();
    if (!RIOT_API_KEY || !RIOT_API_KEY.startsWith('RGAPI-')) {
      return NextResponse.json(
        { error: 'API key not properly configured' },
        { status: 500 }
      );
    }

    // 1. Fetch Account Data
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      summonerName
    )}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch account data', status: accountResponse.status },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();

    // 2. Fetch Summoner Data
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!summonerResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch summoner data', status: summonerResponse.status },
        { status: summonerResponse.status }
      );
    }

    const summonerData = await summonerResponse.json();

    // 3. Fetch Live Game Data
    const liveGameUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerData.id}`;
    const liveGameResponse = await fetch(liveGameUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!liveGameResponse.ok) {
      if (liveGameResponse.status === 404) {
        return NextResponse.json(
          { error: 'Player is not in an active game', status: 404 },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch live game data', status: liveGameResponse.status },
        { status: liveGameResponse.status }
      );
    }

    const liveGameData = await liveGameResponse.json();

    // Return Aggregated Response
    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
