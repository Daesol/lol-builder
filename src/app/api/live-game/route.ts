// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine')?.toUpperCase() || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    console.log('Request params:', { summonerName, tagLine, platform });

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();

    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      return NextResponse.json({
        error: 'API key not properly configured'
      }, { status: 500 });
    }

    // 1. Get Account Info
    console.log('Fetching account info...');
    const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    console.log('Account URL:', accountUrl);
    
    const accountResponse = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!accountResponse.ok) {
      const accountError = await accountResponse.text();
      console.error('Account fetch error:', accountError);
      return NextResponse.json({
        error: 'Account not found',
        details: accountError
      }, { status: accountResponse.status });
    }

    const accountData = await accountResponse.json();
    console.log('Account data:', accountData);

    // 2. Get Summoner data
    console.log('Fetching summoner data...');
    const summonerUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`;
    console.log('Summoner URL:', summonerUrl);

    const summonerResponse = await fetch(summonerUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!summonerResponse.ok) {
      const summonerError = await summonerResponse.text();
      console.error('Summoner fetch error:', summonerError);
      return NextResponse.json({
        error: 'Summoner not found',
        details: summonerError
      }, { status: summonerResponse.status });
    }

    const summonerData = await summonerResponse.json();
    console.log('Summoner data:', summonerData);

    // 3. Check for active game
    console.log('Checking for active game...');
    const liveGameUrl = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerData.id}`;
    console.log('Live game URL:', liveGameUrl);

    const liveGameResponse = await fetch(liveGameUrl, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    let liveGameData = null;
    let gameMessage = 'Player is not in game';

    if (liveGameResponse.ok) {
      liveGameData = await liveGameResponse.json();
      gameMessage = 'Player is in game';
      console.log('Live game data:', liveGameData);
    } else {
      const liveGameError = await liveGameResponse.text();
      console.log('No active game found:', {
        status: liveGameResponse.status,
        error: liveGameError
      });
    }

    // Return complete response
    const response = {
      account: accountData,
      summoner: {
        ...summonerData,
        name: accountData.gameName
      },
      liveGame: liveGameData,
      message: gameMessage
    };

    console.log('Final response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}