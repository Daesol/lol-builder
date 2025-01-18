// app/api/champion-performance/route.ts
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

    console.log('Champion Performance API called:', {
      puuid,
      championId,
      region,
    });

    if (!puuid || !championId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      console.log('Starting champion analysis...');
      // Get match history first
      const matchIds = await riotApi.getMatchHistory(puuid, region, 3);
      const matches = await Promise.all(
        matchIds.map(id => riotApi.getMatch(id, region))
      );
      
      // Filter out null matches
      const validMatches = matches.filter((match): match is Match => match !== null);

      const analysis = await analyzeChampionPerformance(
        validMatches,
        puuid,
        parseInt(championId, 10)
      );
      console.log('Analysis completed:', analysis);

      return NextResponse.json(analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Analysis failed' },
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