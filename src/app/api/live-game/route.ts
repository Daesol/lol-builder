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

    if (!summoner || !tagLine) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get account data
    const account = await riotApi.getAccountData(summoner, tagLine);
    if (!account) {
      return NextResponse.json(
        { error: 'Summoner not found' },
        { status: 404 }
      );
    }

    // Get summoner data
    const summonerData = await riotApi.getSummonerByPUUID(account.puuid, region);
    if (!summonerData) {
      return NextResponse.json(
        { error: 'Summoner data not found' },
        { status: 404 }
      );
    }

    // Get live game data
    const liveGame = await riotApi.getLiveGame(summonerData.id, region);

    // Get last match if not in game
    let lastMatch = null;
    if (!liveGame) {
      const matches = await riotApi.getMatchHistory(account.puuid, region, 1);
      if (matches.length > 0) {
        lastMatch = matches[0];
      }
    }

    const response: ApiResponse = {
      account,
      summoner: summonerData,
      liveGame,
      lastMatch
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Live game API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}