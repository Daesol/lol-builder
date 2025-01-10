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
    const region = (searchParams.get('region') || 'NA1').toUpperCase();

    if (!summonerName) {
      return NextResponse.json({ error: 'Summoner name is required' }, { status: 400 });
    }

    // Get account data first (to get PUUID)
    const accountData = await getAccountData(summonerName, tagLine);
    
    // Get summoner data using PUUID
    const summonerData = await getSummonerData(accountData.puuid, region);
    
    // Get live game data using summoner ID
    const liveGameData = await getLiveGameData(summonerData.id, region);

    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}