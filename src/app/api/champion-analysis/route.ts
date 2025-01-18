import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/utils/analysis';
import { riotApi } from '@/lib/api/riot';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const championId = searchParams.get('championId');
    const region = searchParams.get('region') || 'NA1';

    if (!puuid || !championId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get last 3 matches for analysis
    const matchIds = await riotApi.getMatchHistory(puuid, region, 3);
    const matches = await Promise.all(
      matchIds.map(id => riotApi.getMatch(id, region))
    );

    const analysis = await analyzeChampionPerformance(
      matches,
      puuid,
      parseInt(championId, 10)
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Champion analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
} 