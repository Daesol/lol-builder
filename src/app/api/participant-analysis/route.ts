// app/api/champion-performance/route.ts
import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/riotApiClient';

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

    const analysis = await analyzeChampionPerformance(
      puuid,
      region,
      parseInt(championId, 10)
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in champion performance analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}