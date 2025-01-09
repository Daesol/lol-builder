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

    // 1. Get Riot Account ID using summoner name and tag
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      summonerName
    )}/${encodeURIComponent(tagLine)}`;
    const accountResponse = await fetch(accountUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!accountResponse.ok) {
      return NextResponse.json(
        {
          error: 'Account not found',
          details: await accountResponse.json(),
        },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();

    // 2. Get Summoner data using PUUID
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!summonerResponse.ok) {
      return NextResponse.json(
        {
          error: 'Summoner not found',
          details: await summonerResponse.json(),
        },
        { status: summonerResponse.status }
      );
    }

    const summonerData = await summonerResponse.json();

    // 3. Get Match IDs (most recent match)
    const matchIdsUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountData.puuid}/ids?start=0&count=1`;
    console.log('Fetching recent match ID from:', matchIdsUrl);

    const matchIdsResponse = await fetch(matchIdsUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!matchIdsResponse.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch match IDs',
          details: await matchIdsResponse.json(),
        },
        { status: matchIdsResponse.status }
      );
    }

    const matchIds = await matchIdsResponse.json();
    console.log('Match IDs:', matchIds);

    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json(
        { error: 'No matches found for this summoner' },
        { status: 404 }
      );
    }

    const recentMatchId = matchIds[0];

    // 4. Fetch Match Information using Match ID
    const matchInfoUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/${recentMatchId}`;
    console.log('Fetching match info from:', matchInfoUrl);

    const matchInfoResponse = await fetch(matchInfoUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!matchInfoResponse.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch match information',
          details: await matchInfoResponse.json(),
        },
        { status: matchInfoResponse.status }
      );
    }

    const matchInfo = await matchInfoResponse.json();
    console.log('Match Information:', matchInfo);

    // Return all the data
    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      recentMatchId,
      matchInfo,
      message: 'Match information retrieved successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
