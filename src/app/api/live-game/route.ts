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

    // 1. Get Account Info
    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data fetched:', accountData);

    // 2. Get Summoner Data
    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data fetched:', summonerData);

    // 3. Get Live Game Data using Summoner ID
    const liveGameData = await getLiveGameData(summonerData.id, platform);
    console.log('Live game status:', liveGameData ? 'In game' : 'Not in game');

    // Return the combined data
    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}