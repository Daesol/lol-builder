import { riotApi } from '@/lib/api/riot';
import type { ChampionPerformance, Match } from '@/types/game';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation, ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(operation, retries - 1);
    }
    console.error('Operation failed after all retries:', error);
    return null;
  }
}

export async function analyzeChampionPerformance(
  matches: Match[],
  puuid: string,
  championId: number
): Promise<ChampionPerformance> {
  console.log(`Analyzing performance for PUUID: ${puuid}, Champion: ${championId}`);
  console.log(`Processing ${matches.length} matches`);

  const performance: ChampionPerformance = {
    matchCount: 0,
    championMatchCount: 0,
    wins: 0,
    championWins: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamageDealt: 0,
    championStats: {
      kills: 0,
      deaths: 0,
      assists: 0,
      damageDealt: 0
    },
    commonItems: {},
    commonRunes: {
      primaryTree: 0,
      secondaryTree: 0,
      keystone: 0
    }
  };

  // Process matches sequentially to avoid rate limit issues
  for (const match of matches) {
    try {
      const participant = match.info.participants.find(p => p.puuid === puuid);
      
      if (!participant) {
        console.warn(`Participant ${puuid} not found in match ${match.metadata.matchId}`);
        continue;
      }

      // Log participant data to debug
      console.log('Processing participant:', {
        puuid,
        summonerName: participant.puuid,
        championId: participant.championId
      });

      performance.matchCount++;
      
      if (participant.championId === championId) {
        performance.championMatchCount++;
        if (participant.win) performance.championWins++;
        performance.championStats.kills += participant.kills;
        performance.championStats.deaths += participant.deaths;
        performance.championStats.assists += participant.assists;
        performance.championStats.damageDealt += participant.totalDamageDealtToChampions;
      }

      if (participant.win) performance.wins++;
      performance.totalKills += participant.kills;
      performance.totalDeaths += participant.deaths;
      performance.totalAssists += participant.assists;
      performance.totalDamageDealt += participant.totalDamageDealtToChampions;

      // Track items
      for (let i = 0; i <= 6; i++) {
        const itemId = participant[`item${i}` as keyof typeof participant] as number;
        if (itemId && itemId > 0) {
          if (!performance.commonItems[itemId]) {
            performance.commonItems[itemId] = { count: 0, winCount: 0 };
          }
          performance.commonItems[itemId].count++;
          if (participant.win) {
            performance.commonItems[itemId].winCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing match:`, error);
    }
  }

  console.log('Analysis complete:', {
    puuid,
    championId,
    matchesProcessed: performance.matchCount,
    championMatches: performance.championMatchCount
  });

  return performance;
}