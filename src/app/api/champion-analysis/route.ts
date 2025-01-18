import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/utils/analysis';
import { riotApi } from '@/lib/api/riot';
import type { Match } from '@/types/game';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const championId = searchParams.get('championId');
    const region = searchParams.get('region') || 'NA1';

    console.log('Champion analysis requested:', { puuid, championId, region });

    if (!puuid || !championId) {
      console.log('Missing parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get last 20 matches for analysis
    console.log('Fetching match history...');
    const matchIds = await riotApi.getMatchHistory(puuid, region, 20);
    console.log('Match IDs received:', matchIds);

    console.log('Fetching match details...');
    const matches = await Promise.all(
      matchIds.map(id => riotApi.getMatch(id, region))
    );
    console.log('Match details received:', matches);

    // Filter out null matches
    const validMatches = matches.filter((match): match is Match => match !== null);
    console.log('Valid matches:', validMatches.length);

    const analysis = await analyzeChampionPerformance(
      validMatches,
      puuid,
      parseInt(championId, 10)
    );

    console.log('Analysis complete:', analysis);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Champion analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
} 