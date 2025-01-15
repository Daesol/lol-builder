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

    console.log('Received request:', { summoner, tagLine, region }); // Debug log

    if (!summoner || !tagLine) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      // Get account data
      console.log('Fetching account data...');
      const account = await riotApi.getAccountData(summoner, tagLine);
      if (!account) {
        return NextResponse.json(
          { error: 'Summoner not found' },
          { status: 404 }
        );
      }

      // Get summoner data
      console.log('Fetching summoner data...');
      const summonerData = await riotApi.getSummonerByPUUID(account.puuid, region);
      if (!summonerData) {
        return NextResponse.json(
          { error: 'Summoner data not found' },
          { status: 404 }
        );
      }

      // Get live game data
      console.log('Fetching live game data...');
      const liveGame = await riotApi.getLiveGame(summonerData.id, region);

      // Get last match if not in game
      let lastMatch = null;
      if (!liveGame) {
        console.log('No live game found, fetching last match...');
        const matches = await riotApi.getMatchHistory(account.puuid, region, 1);
        if (matches.length > 0) {
          lastMatch = matches[0];
        }
      }

      const response: ApiResponse = {
        account,
        summoner: summonerData,
        liveGame,
        lastMatch,
        region
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('API request failed:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to fetch game data',
          details: error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Route failed',
        details: error
      },
      { status: 500 }
    );
  }
}