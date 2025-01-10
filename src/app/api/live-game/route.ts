// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
  getMatchIds,
  getMatchDetails
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

    // 1. Get Account Info
    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data fetched:', accountData);

    // 2. Get Summoner Data
    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data fetched:', summonerData);

    // 3. Try to get live game data
    const liveGameData = await getLiveGameData(accountData.puuid, platform).catch(() => null);

    // 4. If not in game, get latest match
    let lastMatch = null;
    if (!liveGameData) {
      try {
        const matchIds = await getMatchIds(accountData.puuid, platform);
        if (matchIds && matchIds.length > 0) {
          lastMatch = await getMatchDetails(matchIds[0], platform);
          console.log('Last match data fetched:', lastMatch);
        }
      } catch (matchError) {
        console.error('Error fetching match data:', matchError);
      }
    }

    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData,
      lastMatch: lastMatch,
      message: liveGameData ? 'Player is in game' : 'Showing last match data'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}