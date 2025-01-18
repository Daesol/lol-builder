import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/utils/analysis';
import { riotApi } from '@/lib/api/riot';
import { REGIONS } from '@/constants/game';
import type { Match } from '@/types/game';
import { kv } from '@vercel/kv';

const MATCHES_TO_ANALYZE = 10;
const BATCH_SIZE = 3;

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

    // New session - start analysis
    if (!sessionId) {
      const newSessionId = Math.random().toString(36).substring(7);
      const matchIds = await riotApi.getMatchHistory(puuid, region, MATCHES_TO_ANALYZE);
      
      await kv.set(newSessionId, {
        matchIds,
        processed: 0,
        results: [],
        completed: false
      }, { ex: 300 }); // Expire in 5 minutes

      return NextResponse.json({
        sessionId: newSessionId,
        total: matchIds.length,
        processed: 0,
        completed: false
      });
    }

    // Continue existing session
    const session = await kv.get(sessionId);
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

      session.results.push(...matches);
      session.processed += nextBatch.length;
      session.completed = session.processed >= session.matchIds.length;

      await kv.set(sessionId, session, { ex: 300 });

      if (session.completed) {
        const validMatches = session.results.filter((match): match is Match => match !== null);
        const analysis = await analyzeChampionPerformance(
          validMatches,
          puuid,
          parseInt(championId, 10)
        );
        await kv.del(sessionId);
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