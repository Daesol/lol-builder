// app/api/champion-performance/route.ts
import { NextResponse } from 'next/server';
import { analyzeChampionPerformance } from '@/lib/performanceAnalyzer';
import { RateLimit } from '@/lib/rateLimit';

// Create a singleton instance of RateLimit
const rateLimiter = new RateLimit();

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
      // Wrap the analysis call with rate limiter
      console.log('Starting champion analysis...');
      const analysis = await rateLimiter.enqueue(async () => {
        return analyzeChampionPerformance(
          puuid,
          region,
          parseInt(championId, 10)
        );
      });
      
      console.log('Analysis completed:', analysis);

      if (!analysis) {
        throw new Error('No analysis data returned');
      }

      return NextResponse.json(analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes('rate limit')) {
          return NextResponse.json(
            { error: 'Rate limit reached. Please try again in a few moments.' },
            { status: 429 }
          );
        }
        if (err.message.includes('timeout')) {
          return NextResponse.json(
            { error: 'Request timed out. Please try again.' },
            { status: 504 }
          );
        }
      }

      return NextResponse.json(
        { 
          error: err instanceof Error 
            ? err.message 
            : 'Analysis failed. Please try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}