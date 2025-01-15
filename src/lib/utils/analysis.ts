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
  
  // Filter matches for the specific champion
  const championMatches = matches.filter(match => {
    if (!match) return false;
    const participant = match.info.participants.find(p => p.puuid === puuid);
    return participant && participant.championId === championId;
  });

  // Initialize performance stats
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalDamageDealt = 0;
  let totalGoldEarned = 0;
  let wins = 0;
  const itemCounts: Record<number, number> = {};

  // Process each match
  const processedMatches = championMatches.map(match => {
    if (!match) return null;
    const participant = match.info.participants.find(p => p.puuid === puuid);
    if (!participant) return null;

    // Update totals
    totalKills += participant.kills;
    totalDeaths += participant.deaths;
    totalAssists += participant.assists;
    totalDamageDealt += participant.totalDamageDealtToChampions;
    totalGoldEarned += participant.goldEarned;
    if (participant.win) wins++;

    // Count items
    [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6,
    ].forEach(itemId => {
      if (itemId > 0) {
        itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
      }
    });

    return {
      matchId: match.metadata.matchId,
      gameCreation: match.info.gameCreation,
      gameDuration: match.info.gameDuration,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      totalDamageDealt: participant.totalDamageDealtToChampions,
      goldEarned: participant.goldEarned,
      items: [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6,
      ].filter(id => id > 0)
    };
  }).filter((match): match is NonNullable<typeof match> => match !== null);

  // Sort items by frequency
  const commonItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .reduce((obj, [itemId, count]) => ({
      ...obj,
      [itemId]: count
    }), {});

  return {
    championId,
    matchCount: processedMatches.length,
    wins,
    totalKills,
    totalDeaths,
    totalAssists,
    totalDamageDealt,
    totalGoldEarned,
    matches: processedMatches,
    commonItems
  };
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