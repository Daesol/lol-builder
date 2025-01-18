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

    // Set a shorter timeout for development
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timeout')), 8000)
    );

    const analysisPromise = async () => {
      const matchIds = await riotApi.getMatchHistory(puuid, region, MATCHES_TO_ANALYZE);
      console.log(`Found ${matchIds.length} matches to analyze`);

      const matches = await riotApi.fetchSequential<Match>(
        matchIds.map(id => riotApi.getMatchUrl(region, id))
      );

      const validMatches = matches.filter((match): match is Match => match !== null);
      console.log(`Successfully processed ${validMatches.length}/${matchIds.length} matches`);

      return analyzeChampionPerformance(
        validMatches,
        puuid,
        parseInt(championId, 10)
      );
    };

    const analysis = await Promise.race([analysisPromise(), timeoutPromise]);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const status = error instanceof Error && error.message === 'Analysis timeout' ? 504 : 500;
    const message = error instanceof Error ? error.message : 'Analysis failed';

    return NextResponse.json({ error: message }, { status });
  }
} 