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

    // Validate API key format
    if (!process.env.RIOT_API_KEY?.startsWith('RGAPI-')) {
      console.error('Invalid API key format:', {
        hasKey: !!process.env.RIOT_API_KEY,
        keyLength: process.env.RIOT_API_KEY?.length,
        keyPrefix: process.env.RIOT_API_KEY?.substring(0, 7)
      });
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

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
      const account = await riotApi.getAccountData(summoner, tagLine);
      const summonerData = await riotApi.getSummonerByPUUID(account.puuid, region);
      const liveGame = await riotApi.getLiveGame(account.puuid, region);

      // Initialize response
      const response: ApiResponse = {
        account,
        summoner: summonerData,
        liveGame: liveGame,
        lastMatch: null,
        region
      };

      // Only fetch match history if needed and handle potential failures gracefully
      if (!liveGame) {
        try {
          const matchIds = await riotApi.getMatchHistory(account.puuid, region, 1);
          if (matchIds.length > 0) {
            response.lastMatch = await riotApi.getMatch(matchIds[0], region);
          }
        } catch (error) {
          console.warn('Failed to fetch match history, continuing with partial data:', error);
        }
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
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}