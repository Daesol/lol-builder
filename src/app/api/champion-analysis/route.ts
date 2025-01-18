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

    console.log('Champion analysis requested:', { puuid, championId, region });

    if (!puuid || !championId) {
      console.log('Missing parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    try {
      // Get last 5 matches for analysis
      console.log('Fetching match history...');
      const matchIds = await riotApi.getMatchHistory(puuid, region, 5);
      console.log('Match IDs received:', matchIds);

      if (!matchIds.length) {
        return NextResponse.json({
          matchCount: 0,
          wins: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalDamageDealt: 0,
          commonItems: {},
          commonRunes: { primaryTree: 0, secondaryTree: 0, keystone: 0 }
        });
      }

      console.log('Fetching match details...');
      const matches = await Promise.all(
        matchIds.map(async (id) => {
          try {
            return await riotApi.getMatch(id, region);
          } catch (error) {
            console.error(`Failed to fetch match ${id}:`, error);
            return null;
          }
        })
      );
      console.log('Match details received:', matches);

      // Filter out null matches
      const validMatches = matches.filter((match): match is Match => match !== null);
      console.log('Valid matches:', validMatches.length);

      if (!validMatches.length) {
        return NextResponse.json({
          matchCount: 0,
          wins: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalDamageDealt: 0,
          commonItems: {},
          commonRunes: { primaryTree: 0, secondaryTree: 0, keystone: 0 }
        });
      }

      const analysis = await analyzeChampionPerformance(
        validMatches,
        puuid,
        parseInt(championId, 10)
      );

      console.log('Analysis complete:', analysis);
      return NextResponse.json(analysis);
    } catch (error) {
      console.error('Analysis process error:', error);
      return NextResponse.json(
        { error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
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