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

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching data for summoner: ${summonerName}, tag: ${tagLine}, region: ${platform}`);

    // 1. Get Account Info (this gives us PUUID)
    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data fetched:', accountData);

    // 2. Get Summoner Data (for additional info)
    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data fetched:', summonerData);

    // 3. Get Live Game Data using summoner ID
    console.log('Attempting to get live game data with:', {
      summonerId: summonerData.id,
      platform: platform
    });
    
    try {
      const liveGameData = await getLiveGameData(summonerData.id, platform);
      console.log('Live game data response:', liveGameData);

      return NextResponse.json({
        account: accountData,
        summoner: summonerData,
        liveGame: liveGameData
      });
    } catch (gameError) {
      console.error('Live game fetch error:', gameError);
      // If there's an error with live game data, return other data anyway
      return NextResponse.json({
        account: accountData,
        summoner: summonerData,
        liveGame: null,
        message: 'Player is not in game'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}