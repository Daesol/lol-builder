// app/api/analysis/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
  getMatchHistory,
  getMatchDetails,
  getChampionMastery,
} from '@/lib/riotApiClient';

interface AnalysisRequest {
  summonerName: string;
  tagLine: string;
  region: string;
}

interface MatchHistorySummary {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  championId: number;
  kills: number;
  deaths: number;
  assists: number;
  items: number[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  visionScore: number;
  win: boolean;
}

interface OpponentAnalysis {
  championId: number;
  summonerName: string;
  matchHistory: MatchHistorySummary[];
  championMastery: {
    championId: number;
    championLevel: number;
    championPoints: number;
    lastPlayTime: number;
  };
}

interface AnalysisData {
  player: {
    summonerName: string;
    champion: number;
  };
  team: {
    championId: number;
    summonerName: string;
  }[];
  opponents: OpponentAnalysis[];
  gameMode: string;
  gameType: string;
}

export async function POST(req: Request) {
  try {
    const body: AnalysisRequest = await req.json();
    const { summonerName, tagLine, region } = body;

    // 1. Get account and summoner data
    const accountData = await getAccountData(summonerName, tagLine);
    const summonerData = await getSummonerData(accountData.puuid, region);

    // 2. Get live game data
    const liveGame = await getLiveGameData(summonerData.id, region);
    if (!liveGame) {
      return NextResponse.json({ error: 'No active game found' }, { status: 404 });
    }

    // 3. Analyze each opponent
    const opponents = liveGame.participants.filter(
      (p: { teamId: number; puuid: string }) => 
        p.teamId !== liveGame.participants.find(
          (p: { puuid: string }) => p.puuid === accountData.puuid
        )?.teamId
    );
    
    const opponentAnalysis = await Promise.all(
      opponents.map(async (opponent: { puuid: string; summonerId: string; championId: number; summonerName: string }) => {
        // Get opponent's match history for their current champion
        const matchHistory = await getMatchHistory(opponent.puuid, region, opponent.championId, 5);
        const matchDetails = await Promise.all(
          matchHistory.map((matchId: string) => getMatchDetails(matchId, region))
        );
        const championMastery = await getChampionMastery(opponent.summonerId, region, opponent.championId);
        
        return {
          championId: opponent.championId,
          summonerName: opponent.summonerName,
          matchHistory: matchDetails.map((match) => {
            const playerData = match.info.participants.find(
              (p: { puuid: string }) => p.puuid === opponent.puuid
            );
            return {
              matchId: match.metadata.matchId,
              gameCreation: match.info.gameCreation,
              gameDuration: match.info.gameDuration,
              championId: playerData?.championId,
              kills: playerData?.kills,
              deaths: playerData?.deaths,
              assists: playerData?.assists,
              items: [
                playerData?.item0,
                playerData?.item1,
                playerData?.item2,
                playerData?.item3,
                playerData?.item4,
                playerData?.item5,
                playerData?.item6,
              ],
              totalDamageDealt: playerData?.totalDamageDealt,
              totalDamageTaken: playerData?.totalDamageTaken,
              visionScore: playerData?.visionScore,
              win: playerData?.win,
            };
          }),
          championMastery,
        };
      })
    );

    const analysisData: AnalysisData = {
      player: {
        summonerName,
        champion: liveGame.participants.find(
          (p: { puuid: string }) => p.puuid === accountData.puuid
        )?.championId,
      },
      team: liveGame.participants
        .filter((p: { teamId: number; puuid: string }) => 
          p.teamId === liveGame.participants.find(
            (p: { puuid: string }) => p.puuid === accountData.puuid
          )?.teamId
        )
        .map((p: { championId: number; summonerName: string }) => ({
          championId: p.championId,
          summonerName: p.summonerName,
        })),
      opponents: opponentAnalysis,
      gameMode: liveGame.gameMode,
      gameType: liveGame.gameType,
    };

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}