// src/app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
} from '@/lib/riotApiClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine') || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    // Log initial request parameters
    console.log('Received request with params:', { summonerName, tagLine, platform });

    // Check if API key exists
    const apiKey = process.env.RIOT_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key starts with:', apiKey?.substring(0, 8));

    if (!summonerName) {
      return NextResponse.json(
        { error: 'Summoner name is required' },
        { status: 400 }
      );
    }

    // 1. Get Account Info
    console.log('Fetching account info...');
    try {
      const accountData = await getAccountData(summonerName, tagLine);
      console.log('Account data fetched successfully:', accountData);

      // 2. Get Summoner Data
      console.log('Fetching summoner data...');
      const summonerData = await getSummonerData(accountData.puuid, platform);
      console.log('Summoner data fetched successfully:', summonerData);

      // 3. Get Live Game Data
      console.log('Fetching live game data...');
      const liveGameData = await getLiveGameData(summonerData.id, platform);
      console.log('Live game data response:', !!liveGameData ? 'Found' : 'Not in game');

      // Return successful response
      return NextResponse.json({
        account: accountData,
        summoner: summonerData,
        liveGame: liveGameData
      });

    } catch (error) {
      console.error('Detailed error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Return specific error based on the stage where it failed
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'An error occurred during API calls' },
        { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
      );
    }
  } catch (error) {
    console.error('Top level error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}