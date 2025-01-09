// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine')?.toUpperCase() || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    console.log('Request params:', { summonerName, tagLine, platform });

    if (!summonerName) {
      console.error('Summoner name is missing in the request.');
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();
    if (!RIOT_API_KEY || !RIOT_API_KEY.startsWith('RGAPI-')) {
      console.error('API key is missing or invalid.');
      return NextResponse.json(
        { error: 'API key not properly configured' },
        { status: 500 }
      );
    }

    // 1. Fetch Account Data
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      summonerName
    )}/${encodeURIComponent(tagLine)}`;
    console.log('Fetching account data from:', accountUrl);

    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!accountResponse.ok) {
      const accountError = await accountResponse.text();
      console.error('Account fetch failed:', {
        status: accountResponse.status,
        error: accountError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch account data', details: accountError },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();
    console.log('Account data fetched successfully:', accountData);

    // 2. Fetch Summoner Data
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    console.log('Fetching summoner data from:', summonerUrl);

    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    if (!summonerResponse.ok) {
      const summonerError = await summonerResponse.text();
      console.error('Summoner fetch failed:', {
        status: summonerResponse.status,
        error: summonerError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch summoner data', details: summonerError },
        { status: summonerResponse.status }
      );
    }

    const summonerData = await summonerResponse.json();
    console.log('Summoner data fetched successfully:', summonerData);

    // 3. Fetch Live Game Data
    const liveGameUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerData.id}`;
    console.log('Fetching live game data from:', liveGameUrl);

    const liveGameResponse = await fetch(liveGameUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY },
    });

    const liveGameResponseBody = await liveGameResponse.text();
    console.log('Live game response status:', liveGameResponse.status);
    console.log('Live game response headers:', liveGameResponse.headers);
    console.log('Live game response body:', liveGameResponseBody);

    if (!liveGameResponse.ok) {
      if (liveGameResponse.status === 403) {
        console.error('Forbidden: API key may lack necessary permissions or has expired.');
        return NextResponse.json(
          {
            error: 'Access denied. Verify your API key and permissions.',
            status: 403,
          },
          { status: 403 }
        );
      }

      if (liveGameResponse.status === 404) {
        console.log('No active game found for the summoner.');
        return NextResponse.json(
          { error: 'Player is not in an active game', status: 404 },
          { status: 404 }
        );
      }

      console.error('Unexpected error fetching live game data:', {
        status: liveGameResponse.status,
        body: liveGameResponseBody,
      });
      return NextResponse.json(
        { error: 'Failed to fetch live game data', details: liveGameResponseBody },
        { status: liveGameResponse.status }
      );
    }

    const liveGameData = JSON.parse(liveGameResponseBody);
    console.log('Live game data fetched successfully:', liveGameData);

    // Return Aggregated Response
    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData,
    });
  } catch (error) {
    console.error('Unexpected error occurred:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: errorMessage },
      { status: 500 }
    );
  }
}
