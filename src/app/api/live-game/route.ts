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
      hasApiKey: !!process.env.RIOT_API_KEY 
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
      
      // Get live game data using PUUID
      const liveGame = await riotApi.getLiveGame(account.puuid, region);

      // Get recent matches
      const matchIds = await riotApi.getMatchHistory(account.puuid, region, 1);
      const lastMatch = matchIds.length > 0 
        ? await riotApi.getMatch(matchIds[0], region)
        : null;

      const response: ApiResponse = {
        account,
        summoner: summonerData,
        liveGame,
        lastMatch,
        region
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('API Route - Request failed:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Route - Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Route failed' },
      { status: 500 }
    );
  }
}