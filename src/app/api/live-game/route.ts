// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
} from '@/lib/riotApiClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine') || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    console.log('Processing request:', { summonerName, tagLine, platform });

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    // Step 1: Get account data
    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data received:', accountData);

    // Step 2: Get summoner data
    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data received:', summonerData);

    // Step 3: Get live game data
    const liveGameData = await getLiveGameData(summonerData.id, platform);
    console.log('Live game data:', liveGameData ? 'Found' : 'Not in game');

    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData
    });

  } catch (error) {
    console.error('Request failed:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}