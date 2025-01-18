import { riotApi } from '@/lib/api/riot';
import type { ChampionPerformance, LiveGame, LiveGameAnalysis, Match } from '@/types/game';
import { rateLimit } from '@/lib/utils/cache';

export async function analyzeChampionPerformance(
  matches: Match[],
  puuid: string,
  championId: number
): Promise<ChampionPerformance> {
  console.log('Starting champion performance analysis:', {
    matchCount: matches.length,
    puuid,
    championId
  });

  const performance: ChampionPerformance = {
    matchCount: 0,
    wins: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamageDealt: 0,
    commonItems: {},
    commonRunes: {
      primaryTree: 0,
      secondaryTree: 0,
      keystone: 0
    }
  };

  matches.forEach(match => {
    const participant = match.info.participants.find(p => p.puuid === puuid);
    if (!participant) {
      console.log('Participant not found in match:', match.metadata.matchId);
      return;
    }

    performance.matchCount++;
    if (participant.win) performance.wins++;
    performance.totalKills += participant.kills;
    performance.totalDeaths += participant.deaths;
    performance.totalAssists += participant.assists;
    performance.totalDamageDealt += participant.totalDamageDealtToChampions;

    // Log match stats
    console.log('Processed match:', {
      matchId: match.metadata.matchId,
      stats: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        damage: participant.totalDamageDealtToChampions,
        win: participant.win
      }
    });
  });

  console.log('Analysis complete:', performance);
  return performance;
}

export const analyzeLiveGame = async (
  game: LiveGame,
  region: string
): Promise<LiveGameAnalysis> => {
  // Process participants in batches to respect rate limits
  const participantAnalyses = [];
  
  for (const participant of game.participants) {
    await rateLimit.waitForAvailability();
    try {
      // Get match history first
      const matchIds = await riotApi.getMatchHistory(participant.puuid, region, 3);
      const matches = await Promise.all(
        matchIds.map(id => riotApi.getMatch(id, region))
      );
      
      // Filter out null matches
      const validMatches = matches.filter((match): match is Match => match !== null);

      const analysis = await analyzeChampionPerformance(
        validMatches,
        participant.puuid,
        participant.championId
      );

      participantAnalyses.push({
        puuid: participant.puuid,
        summonerName: participant.summonerName,
        teamId: participant.teamId,
        analysis
      });
    } catch (error) {
      console.error(`Error analyzing participant ${participant.summonerName}:`, error);
    }
  }

  return {
    blueTeam: participantAnalyses.filter(p => p.teamId === 100),
    redTeam: participantAnalyses.filter(p => p.teamId === 200)
  };
};