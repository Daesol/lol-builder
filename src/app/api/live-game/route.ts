// app/api/live-game/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
  analyzeChampionPerformance
} from '@/lib/riotApiClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summonerName = searchParams.get('summoner');
    const tagLine = searchParams.get('tagLine') || 'NA1';
    const platform = (searchParams.get('region') || 'NA1').toUpperCase();

    if (!summonerName) {
      return NextResponse.json({ error: 'Summoner name is required' }, { status: 400 });
    }

    // Get Account Info
    const accountData = await getAccountData(summonerName, tagLine);
    console.log('Account data:', accountData);

    // Get Summoner Data
    const summonerData = await getSummonerData(accountData.puuid, platform);
    console.log('Summoner data:', summonerData);

    // Get live game data
    const liveGameData = await getLiveGameData(summonerData.id, platform);
    console.log('Live game data:', liveGameData);

    if (liveGameData) {
      // Analyze all participants in parallel
      const participantAnalyses = await Promise.allSettled(
        liveGameData.participants.map(async (participant: { summonerId: string; championId: number; summonerName: any; }) => {
          try {
            const analysis = await analyzeChampionPerformance(
              participant.summonerId,
              platform,
              participant.championId
            );
            return {
              summonerId: participant.summonerId,
              analysis
            };
          } catch (error) {
            console.error(`Error analyzing participant ${participant.summonerName}:`, error);
            return {
              summonerId: participant.summonerId,
              analysis: null
            };
          }
        })
      );

      // Add analyses to live game data
      const analyzedParticipants = liveGameData.participants.map((participant: { summonerId: any; }) => {
        const analysis = participantAnalyses.find(
          pa => pa.status === 'fulfilled' && 
          pa.value?.summonerId === participant.summonerId
        );
        return {
          ...participant,
          analysis: analysis?.status === 'fulfilled' ? analysis.value.analysis : null
        };
      });

      liveGameData.participants = analyzedParticipants;
    }

    return NextResponse.json({
      account: accountData,
      summoner: summonerData,
      liveGame: liveGameData,
      message: liveGameData ? 'Player is in game' : 'Player is not in game'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}