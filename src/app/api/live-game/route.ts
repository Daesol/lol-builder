// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine')?.toUpperCase() || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();

    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      return NextResponse.json({
        error: 'API key not properly configured',
        keyDetails: {
          hasKey: !!RIOT_API_KEY,
          startsWithRGAPI: RIOT_API_KEY?.startsWith('RGAPI-'),
          length: RIOT_API_KEY?.length
        }
      }, { status: 500 });
    }

    // 1. First get Riot Account Info
    console.log('Fetching account info for:', summonerName, tagLine);
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    
    const accountResponse = await fetch(accountUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    if (!accountResponse.ok) {
      console.log('Account fetch failed:', await accountResponse.text());
      return NextResponse.json({
        error: 'Account not found',
        details: await accountResponse.json()
      }, { status: accountResponse.status });
    }

    const accountData = await accountResponse.json();
    console.log('Account data:', accountData);

    // 2. Get Summoner data using PUUID
    console.log('Fetching summoner data using PUUID:', accountData.puuid);
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    if (!summonerResponse.ok) {
      console.log('Summoner fetch failed:', await summonerResponse.text());
      return NextResponse.json({
        error: 'Summoner not found',
        details: await summonerResponse.json()
      }, { status: summonerResponse.status });
    }

    const summonerData = await summonerResponse.json();
    console.log('Summoner data:', summonerData);

    // 3. Check for active game
    console.log('Checking for active game...');
    const liveGameUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerData.id}`;
    const liveGameResponse = await fetch(liveGameUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    let liveGameData = null;
    let gameMessage = 'Player is not in game';

    if (liveGameResponse.ok) {
      liveGameData = await liveGameResponse.json();
      gameMessage = 'Player is in game';
      console.log('Live game data:', liveGameData);
    } else {
      console.log('No active game found:', liveGameResponse.status);
    }

    // Return complete response
    return NextResponse.json({
      account: accountData,
      summoner: {
        ...summonerData,
        name: accountData.gameName // Use the game name from account data
      },
      liveGame: liveGameData,
      message: gameMessage
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}