// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import type { Summoner, LiveGame } from '@/types/riot';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const summonerName = searchParams.get('summoner');
  const region = searchParams.get('region')?.toLowerCase() || 'na1';

  if (!summonerName) {
    return NextResponse.json(
      { error: 'Summoner name is required' },
      { status: 400 }
    );
  }

  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // 1. Get summoner data
    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );

    if (!summonerRes.ok) {
      throw new Error('Summoner not found');
    }

    const summoner: Summoner = await summonerRes.json();

    // 2. Get live game data
    const liveGameRes = await fetch(
      `https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner.id}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY
        }
      }
    );

    let liveGame: LiveGame | null = null;
    if (liveGameRes.ok) {
      liveGame = await liveGameRes.json();
    }

    // 3. Generate recommendations (mock data for now)
    const recommendations = liveGame ? {
      buildPath: {
        items: [
          {
            id: 3157,
            name: "Zhonya's Hourglass",
            description: "Active: Stasis",
            priority: 'core' as const,
            cost: 2600,
            imageUrl: '/items/3157.png'
          },
          // Add more mock items here
        ],
        totalCost: 2600,
        buildOrder: ["Seeker's Armguard", "Stopwatch", "Zhonya's Hourglass"]
      },
      alternativeItems: []
    } : null;

    return NextResponse.json({
      summoner,
      liveGame,
      recommendations
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}