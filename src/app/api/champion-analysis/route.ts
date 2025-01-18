import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/utils/analysis';
import { riotApi } from '@/lib/api/riot';
import { rateLimit } from '@/lib/utils/cache';
import { REGIONS } from '@/constants/game';
import type { Match } from '@/types/game';

const MATCHES_TO_ANALYZE = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const championId = searchParams.get('championId');
    const region = (searchParams.get('region') || 'NA1') as keyof typeof REGIONS;

    if (!puuid || !championId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const matches = await rateLimit.waitForAvailability().then(async () => {
      const matchIds = await riotApi.getMatchHistory(puuid, region, MATCHES_TO_ANALYZE);
      return Promise.all(
        matchIds.map(id => 
          rateLimit.waitForAvailability().then(() => riotApi.getMatch(id, region))
        )
      );
    });

    const validMatches = matches.filter((match): match is Match => match !== null);
    
    const analysis = await analyzeChampionPerformance(
      validMatches,
      puuid,
      parseInt(championId, 10)
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
} 