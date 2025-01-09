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
    console.log('Fetching summoner data for:', summonerName, 'in region:', region);
    
    // 1. Get summoner data
    const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    console.log('Summoner API URL:', summonerUrl);
    
    const summonerRes = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    if (!summonerRes.ok) {
      const errorText = await summonerRes.text();
      console.error('Summoner API Error:', {
        status: summonerRes.status,
        statusText: summonerRes.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: `Summoner API Error: ${summonerRes.status} - ${errorText}` },
        { status: summonerRes.status }
      );
    }

    const summoner: Summoner = await summonerRes.json();
    console.log('Summoner data received:', summoner);

    // 2. Get live game data
    const liveGameUrl = `https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner.id}`;
    console.log('Live game API URL:', liveGameUrl);
    
    const liveGameRes = await fetch(liveGameUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    let liveGame: LiveGame | null = null;
    if (liveGameRes.ok) {
      liveGame = await liveGameRes.json();
      console.log('Live game data received');
    } else {
      console.log('No active game found:', liveGameRes.status);
    }

    // Send back the response
    return NextResponse.json({
      summoner,
      liveGame,
      recommendations: liveGame ? {
        buildPath: {
          items: [
            {
              id: 3157,
              name: "Zhonya's Hourglass",
              description: "Active: Stasis",
              priority: 'core' as const,
              cost: 2600,
              imageUrl: '/items/3157.png'
            }
          ],
          totalCost: 2600,
          buildOrder: ["Seeker's Armguard", "Stopwatch", "Zhonya's Hourglass"]
        },
        alternativeItems: []
      } : null
    });
  } catch (error) {
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}