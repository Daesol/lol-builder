import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/utils/analysis';
import { riotApi } from '@/lib/api/riot';
import { REGIONS } from '@/constants/game';
import type { Match } from '@/types/game';
import { analysisKV, type AnalysisSession } from '@/lib/kv';
import { BATCH_SIZE, MATCHES_TO_ANALYZE } from '@/constants/game';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puuid = searchParams.get('puuid');
    const championId = searchParams.get('championId');
    const region = (searchParams.get('region') || 'NA1') as keyof typeof REGIONS;
    const sessionId = searchParams.get('sessionId');

    if (!puuid || !championId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!sessionId) {
      const newSessionId = Math.random().toString(36).substring(7);
      const matchIds = await riotApi.getMatchHistory(puuid, region, MATCHES_TO_ANALYZE);
      
      const initialSession: AnalysisSession = {
        matchIds,
        processed: 0,
        results: [],
        completed: false
      };

      await analysisKV.createSession(newSessionId, initialSession);

      return NextResponse.json({
        sessionId: newSessionId,
        total: matchIds.length,
        processed: 0,
        completed: false
      });
    }

    const session = await analysisKV.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 404 });
    }

    // Process next batch
    const nextBatch = session.matchIds.slice(
      session.processed,
      session.processed + BATCH_SIZE
    );

    if (nextBatch.length > 0) {
      const matches = await riotApi.fetchSequential<Match>(
        nextBatch.map(id => riotApi.getMatchUrl(region, id))
      );

      // Filter out null values before pushing to results
      const validMatches = matches.filter((match): match is Match => match !== null);
      session.results.push(...validMatches);
      session.processed += nextBatch.length;
      session.completed = session.processed >= session.matchIds.length;

      await analysisKV.updateSession(sessionId, session);

      if (session.completed) {
        // No need to filter again since we already filtered when pushing
        const analysis = await analyzeChampionPerformance(
          session.results,
          puuid,
          parseInt(championId, 10)
        );
        await analysisKV.deleteSession(sessionId);
        return NextResponse.json(analysis);
      }

      return NextResponse.json({
        sessionId,
        total: session.matchIds.length,
        processed: session.processed,
        completed: false
      });
    }

    return NextResponse.json({ error: 'Invalid session state' }, { status: 400 });
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
} 