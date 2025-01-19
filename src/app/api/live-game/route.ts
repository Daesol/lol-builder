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

    console.log('Live game API called:', { summoner, tagLine, region });

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

    if (!summoner || !tagLine) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      console.log('Fetching account data...');
      const account = await riotApi.getAccountData({ 
        gameName: summoner, 
        tagLine, 
        region 
      });
      console.log('Account found:', account);

      console.log('Fetching summoner data...');
      const summonerData = await riotApi.getSummonerByPUUID(account.puuid, region);
      console.log('Summoner data:', summonerData);

      console.log('Checking for live game...');
      const liveGame = await riotApi.getLiveGame(account.puuid, region);
      console.log('Live game status:', liveGame ? 'In game' : 'Not in game');

      const response: ApiResponse = {
        account,
        summoner: summonerData,
        liveGame,
        lastMatch: null,
        region
      };

      if (!liveGame) {
        try {
          console.log('No live game, fetching recent match...');
          const matchIds = await riotApi.getMatchHistory(account.puuid, region, 1);
          if (matchIds.length > 0) {
            response.lastMatch = await riotApi.getMatch(matchIds[0], region);
          }
        } catch (error) {
          console.warn('Failed to fetch match history:', error);
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
    console.error('Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Route failed' },
      { status: 500 }
    );
  }
}