// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getMatchIds,
  getMatchInfo,
} from '@/lib/riotApiClient';
import { extractRelevantData } from '@/lib/matchDataUtils';

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

    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data fetched:', accountData);

    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data fetched:', summonerData);

    const matchIds = await getMatchIds(accountData.puuid);
    if (matchIds.length === 0) {
      return NextResponse.json(
        { error: 'No matches found for this summoner' },
        { status: 404 }
      );
    }
    const recentMatchId = matchIds[0];
    console.log('Most recent match ID:', recentMatchId);

    const matchInfo = await getMatchInfo(recentMatchId);
    console.log('Match information fetched:', matchInfo);

    const relevantData = extractRelevantData(matchInfo);
    console.log('Relevant data extracted:', relevantData);

    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      recentMatchId,
      matchInfo: relevantData,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
