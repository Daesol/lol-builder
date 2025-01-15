import { riotApi } from '@/lib/api/riot';
import type { ChampionPerformance, LiveGame, LiveGameAnalysis } from '@/types/game';

export const analyzeChampionPerformance = async (
  puuid: string,
  region: string,
  championId: number
): Promise<ChampionPerformance> => {
  const matches = await riotApi.getMatchHistory(puuid, region, 20);
  const championMatches = matches.filter(match => {
    const participant = match.info.participants.find(p => p.puuid === puuid);
    return participant && participant.championId === championId;
  });

  const performance: ChampionPerformance = {
    championId,
    matchCount: championMatches.length,
    wins: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamageDealt: 0,
    totalGoldEarned: 0,
    matches: [],
    commonItems: {}
  };

  championMatches.forEach(match => {
    const participant = match.info.participants.find(p => p.puuid === puuid)!;
    
    performance.wins += participant.win ? 1 : 0;
    performance.totalKills += participant.kills;
    performance.totalDeaths += participant.deaths;
    performance.totalAssists += participant.assists;
    performance.totalDamageDealt += participant.totalDamageDealtToChampions;
    performance.totalGoldEarned += participant.goldEarned;

    const items = [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6
    ].filter((item): item is number => item !== undefined && item > 0);

    performance.matches.push({
      matchId: match.metadata.matchId,
      gameCreation: match.info.gameCreation,
      gameDuration: match.info.gameDuration,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      itemBuild: items,
      damageDealt: participant.totalDamageDealtToChampions,
      goldEarned: participant.goldEarned,
      role: participant.teamPosition,
      lane: participant.lane
    });

    // Analyze item frequency
    items.forEach(itemId => {
      if (!performance.commonItems[itemId]) {
        performance.commonItems[itemId] = { count: 0, winCount: 0 };
      }
      performance.commonItems[itemId].count++;
      if (participant.win) {
        performance.commonItems[itemId].winCount++;
      }
    });
  });

  return performance;
};

export const analyzeLiveGame = async (
    game: LiveGame,
    region: string
  ): Promise<LiveGameAnalysis> => {
    const participantAnalyses = await Promise.all(
      game.participants.map(async participant => {
        try {
          const analysis = await analyzeChampionPerformance(
            participant.puuid,
            region,
            participant.championId
          );
  
          return {
            summonerId: participant.summonerId,
            summonerName: participant.summonerName,
            championId: participant.championId,
            teamId: participant.teamId,
            championAnalysis: analysis
          };
        } catch (error) {
          console.error(`Error analyzing participant ${participant.summonerName}:`, error);
          return {
            summonerId: participant.summonerId,
            summonerName: participant.summonerName,
            championId: participant.championId,
            teamId: participant.teamId,
            championAnalysis: {
              championId: participant.championId,
              matchCount: 0,
              wins: 0,
              totalKills: 0,
              totalDeaths: 0,
              totalAssists: 0,
              totalDamageDealt: 0,
              totalGoldEarned: 0,
              matches: [],
              commonItems: {}
            }
          };
        }
      })
    );
  
    return {
      timestamp: Date.now(),
      gameId: game.gameId,
      gameMode: game.gameMode,
      participants: participantAnalyses
    };
  };