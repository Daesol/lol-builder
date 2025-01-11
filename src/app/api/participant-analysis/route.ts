// app/api/participant-analysis/route.ts
import { NextResponse } from 'next/server';
import { analyzeParticipantChampions } from '@/lib/riotApiClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const summonerId = searchParams.get('summonerId');
    const region = searchParams.get('region') || 'NA1';

    if (!puuid || !summonerId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const analysis = await analyzeParticipantChampions(puuid, summonerId, region);
    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Error in participant analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}