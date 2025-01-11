// app/api/champion-performance/route.ts
import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/riotApiClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const championId = searchParams.get('championId');
    const region = searchParams.get('region') || 'NA1';
    const summonerId = searchParams.get('summonerId');

    console.log('Champion Performance API called:', {
      puuid,
      championId,
      region,
      summonerId
    });

    if (!puuid || !championId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      // For both live game and last match analysis
      console.log('Starting champion analysis...');
      const analysis = await analyzeChampionPerformance(
        puuid,
        region,
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