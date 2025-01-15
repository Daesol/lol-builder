// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import { riotApi } from '@/lib/api/riot';
import type { ApiResponse } from '@/types/game';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summoner = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine');
    const region = searchParams.get('region') || 'NA1';

    console.log('API Route - Received request:', { 
      summoner, 
      tagLine, 
      region,
      hasApiKey: !!process.env.RIOT_API_KEY,
      apiKeyLength: process.env.RIOT_API_KEY?.length 
    });

    if (!summoner || !tagLine) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      // Get account data first
      const account = await riotApi.getAccountData(summoner, tagLine);
      console.log('API Route - Account data:', account);
      
      // Get summoner data using PUUID
      const summonerData = await riotApi.getSummonerByPUUID(account.puuid, region);
      console.log('API Route - Summoner data:', summonerData);
      
      // Get live game data using summonerId
      const liveGame = await riotApi.getLiveGame(summonerData.id, region);
      console.log('API Route - Live game data:', liveGame);

      // If we can't access spectator API, we'll still return the data we have
      const response: ApiResponse = {
        account,
        summoner: summonerData,
        liveGame: liveGame, // This will be null if we can't access spectator API
        region
      };

      // Get recent matches if we couldn't get live game data
      if (!liveGame) {
        const matchIds = await riotApi.getMatchHistory(account.puuid, region, 1);
        response.lastMatch = matchIds.length > 0 
          ? await riotApi.getMatch(matchIds[0], region)
          : null;
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error('API Route - Request failed:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Route - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}