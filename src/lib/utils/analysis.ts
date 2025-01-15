import { riotApi } from '@/lib/api/riot';
import type { ChampionPerformance, LiveGame, LiveGameAnalysis } from '@/types/game';

export const analyzeChampionPerformance = async (
  puuid: string,
  region: string,
  championId: number
): Promise<ChampionPerformance> => {
  // Get match IDs first
  const matchIds = await riotApi.getMatchHistory(puuid, region, 20);
  
  // Fetch full match data for each ID
  const matchPromises = matchIds.map(matchId => riotApi.getMatch(matchId, region));
  const matches = await Promise.all(matchPromises);
  
  // Initialize performance stats
  const performance: ChampionPerformance = {
    championId,
    matchCount: 0,
    wins: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamageDealt: 0,
    totalGoldEarned: 0,
    matches: [],
    commonItems: {}
  };

  // Process each match
  const processedMatches = matches
    .filter((match): match is NonNullable<typeof match> => {
      if (!match) return false;
      const participant = match.info.participants.find(p => p.puuid === puuid);
      return participant?.championId === championId;
    })
    .map(match => {
      const participant = match.info.participants.find(p => p.puuid === puuid)!;

      // Update totals
      performance.matchCount++;
      performance.totalKills += participant.kills;
      performance.totalDeaths += participant.deaths;
      performance.totalAssists += participant.assists;
      performance.totalDamageDealt += participant.totalDamageDealtToChampions;
      performance.totalGoldEarned += participant.goldEarned;
      if (participant.win) performance.wins++;

      // Process items and track win rates
      const items = [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6,
      ].filter(id => id > 0);

      items.forEach(itemId => {
        if (!performance.commonItems[itemId]) {
          performance.commonItems[itemId] = { count: 0, winCount: 0 };
        }
        performance.commonItems[itemId].count++;
        if (participant.win) {
          performance.commonItems[itemId].winCount++;
        }
      });

      // Determine role and lane
      const role = participant.teamPosition || participant.role || '';
      const lane = participant.lane || '';

      return {
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
        role,
        lane
      };
    });

  performance.matches = processedMatches;
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