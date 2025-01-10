// app/api/analysis/route.ts
import { NextResponse } from 'next/server';
import {
  getAccountData,
  getSummonerData,
  getLiveGameData,
  getDetailedMatchHistory,
  getChampionMastery,
  getLeagueEntries,
} from '@/lib/riotApiClient';

interface AnalysisRequest {
  summonerName: string;
  tagLine: string;
  region: string;
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
    const opponents = liveGame.participants.filter((p: { teamId: any; }) => p.teamId !== liveGame.participants.find((p: { puuid: any; }) => p.puuid === accountData.puuid)?.teamId);
    
    const opponentAnalysis = await Promise.all(opponents.map(async (opponent: { puuid: string; championId: number | undefined; summonerId: string; summonerName: any; }) => {
      // Get opponent's match history for their current champion
      const matchHistory = await getDetailedMatchHistory(opponent.puuid, region, opponent.championId, 5);
      const championMastery = await getChampionMastery(opponent.summonerId, region, opponent.championId);
      
      return {
        championId: opponent.championId,
        summonerName: opponent.summonerName,
        matchHistory,
        championMastery,
      };
    }));

    // 4. Prepare data for LLM analysis
    const analysisData = {
      player: {
        summonerName,
        champion: liveGame.participants.find((p: { puuid: any; }) => p.puuid === accountData.puuid)?.championId,
      },
      team: liveGame.participants.filter((p: { teamId: any; }) => p.teamId === liveGame.participants.find((p: { puuid: any; }) => p.puuid === accountData.puuid)?.teamId),
      opponents: opponentAnalysis,
      gameMode: liveGame.gameMode,
      gameType: liveGame.gameType,
    };

    // 5. Send to LLM for analysis
    const analysis = await analyzeDateWithLLM(analysisData);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

async function analyzeDateWithLLM(data: any) {
  // You'll need to implement your LLM integration here
  // Example using OpenAI's API:
  
  const prompt = `
    Analyze this League of Legends game data and provide recommendations:
    
    Player Champion: ${data.player.champion}
    Game Mode: ${data.gameMode}
    
    Opponent Analysis:
    ${data.opponents.map((opp: { championId: any; championMastery: { championPoints: any; }; matchHistory: any[]; }) => `
      Champion ${opp.championId}:
      - Mastery: ${opp.championMastery.championPoints}
      - Recent Performance: ${summarizeMatchHistory(opp.matchHistory)}
    `).join('\n')}
    
    Based on this data, provide:
    1. Recommended build path
    2. Early game strategy
    3. Mid game objectives
    4. Late game approach
    5. Key items to counter specific opponents
  `;

  // Implement your LLM call here
  // const completion = await openai.createCompletion({...})
  
  // For now, return placeholder data
  return {
    buildPath: ["Item 1", "Item 2", "Item 3"],
    strategy: {
      early: "Focus on farming and avoiding trades",
      mid: "Group for objectives",
      late: "Split push and look for picks"
    },
    counterItems: {
      "opponent1": ["Item A", "Item B"],
      "opponent2": ["Item C", "Item D"]
    }
  };
}

function summarizeMatchHistory(matches: any[]) {
  const kdaAvg = matches.reduce((acc, match) => ({
    kills: acc.kills + match.kills,
    deaths: acc.deaths + match.deaths,
    assists: acc.assists + match.assists
  }), { kills: 0, deaths: 0, assists: 0 });
  
  return `KDA: ${(kdaAvg.kills / matches.length).toFixed(1)}/${(kdaAvg.deaths / matches.length).toFixed(1)}/${(kdaAvg.assists / matches.length).toFixed(1)}`;
}