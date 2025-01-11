// src/lib/riotApiClient.ts

import { LiveGame } from "@/types/game";

// Rate Limiter Implementation
class RateLimit {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private requestCount = 0;
  private lastReset = Date.now();

  // Riot API limits:
  // 20 requests per 1 second
  // 100 requests per 2 minutes
  private readonly shortTermLimit = 20;
  private readonly shortTermWindow = 1000; // 1 second
  private readonly longTermLimit = 100;
  private readonly longTermWindow = 120000; // 2 minutes

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceReset = now - this.lastReset;

      // Reset counter if window has passed
      if (timeSinceReset >= this.shortTermWindow) {
        this.requestCount = 0;
        this.lastReset = now;
      }

      // Check if we're within rate limits
      if (this.requestCount >= this.shortTermLimit) {
        // Wait until the next window
        await new Promise(resolve => 
          setTimeout(resolve, this.shortTermWindow - timeSinceReset)
        );
        continue;
      }

      const request = this.queue.shift();
      if (request) {
        this.requestCount++;
        try {
          await request();
        } catch (error) {
          console.error('Rate limited request failed:', error);
        }
      }
    }

    this.processing = false;
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}

// Create rate limiter instance
const rateLimit = new RateLimit();

// Base request function with rate limiting
const makeRiotRequest = async (url: string) => {
  return rateLimit.enqueue(async () => {
    const apiKey = process.env.RIOT_API_KEY;
    console.log('Making request:', {
      url,
      hasKey: !!apiKey,
      keyPrefix: apiKey?.substring(0, 8)
    });

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': apiKey || ''
      }
    });

    console.log('Response status:', response.status);

    if (response.status === 429) {
      // Handle rate limit exceeded
      const retryAfter = response.headers.get('Retry-After') || '1';
      console.log(`Rate limit exceeded, waiting ${retryAfter}s`);
      await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return makeRiotRequest(url); // Retry the request
    }

    if (response.status === 404) {
      return null;
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          data: data,
          url: url
        });
      }
      return data;
    } catch {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response format');
    }
  });
};

// API Endpoints
export const getAccountData = async (summonerName: string, tagLine: string) => {
  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
  const data = await makeRiotRequest(url);
  if (!data) throw new Error('Account not found');
  return data;
};

export const getSummonerData = async (puuid: string, region: string) => {
  const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const data = await makeRiotRequest(url);
  if (!data) throw new Error('Summoner not found');
  return data;
};

export const getLiveGameData = async (summonerId: string, region: string) => {
  const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${summonerId}`;
  return makeRiotRequest(url);
};

export const getParticipantMatchHistory = async (puuid: string, region: string, count: number = 20) => {
  const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                       region.toLowerCase().includes('euw') ? 'europe' :
                       region.toLowerCase().includes('kr') ? 'asia' :
                       'americas';
                         
  const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  console.log('Fetching match history:', { url, puuid, count });
  
  const data = await makeRiotRequest(url);
  if (!data) {
    console.log('No matches found for:', puuid);
    return [];
  }
  return data;
};

export const getMatchDetails = async (matchId: string, region: string) => {
  const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                       region.toLowerCase().includes('euw') ? 'europe' :
                       region.toLowerCase().includes('kr') ? 'asia' :
                       'americas';

  const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const data = await makeRiotRequest(url);
  if (!data) throw new Error('Match not found');
  return data;
};

// Types for performance analysis
interface ChampionPerformance {
  championId: number;
  matchCount: number;
  wins: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalDamageDealt: number;
  totalGoldEarned: number;
  matches: Array<{
    matchId: string;
    gameCreation: number;
    gameDuration: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    itemBuild: number[];
    damageDealt: number;
    goldEarned: number;
    role: string;
    lane: string;
  }>;
  commonItems: {
    [key: string]: {
      count: number;
      winCount: number;
    };
  };
}

export interface LiveGameAnalysis {
  timestamp: number;
  gameId: number;
  gameMode: string;
  participants: Array<{
    summonerId: string;
    summonerName: string;
    championId: number;
    teamId: number;
    championAnalysis: ChampionPerformance;
  }>;
}

// Analysis functions
export const analyzeChampionPerformance = async (
  puuid: string, 
  region: string, 
  currentChampionId: number
): Promise<ChampionPerformance> => {
  try {
    // Get last 20 matches
    console.log('Fetching match history:', { puuid, region, currentChampionId });
    const matchIds = await getParticipantMatchHistory(puuid, region, 20);
    console.log('Found match IDs:', matchIds?.length || 0);

    if (!matchIds || matchIds.length === 0) {
      console.log('No matches found');
      return {
        championId: currentChampionId,
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
    }

    // Get details for all matches with error handling
    const matchDetailsPromises = matchIds.map((matchId: string) => 
      getMatchDetails(matchId, region)
        .catch(error => {
          console.error(`Error fetching match ${matchId}:`, error);
          return null;
        })
    );

    const matchDetails = (await Promise.all(matchDetailsPromises)).filter(match => match !== null);
    console.log('Successfully fetched match details:', matchDetails.length);

    // Filter and analyze matches only for the current champion
    const championMatches = matchDetails
      .map(match => {
        if (!match?.info?.participants) {
          console.log('Invalid match data structure:', match);
          return null;
        }

        const participant = match.info.participants.find((p: { puuid: string; }) => p.puuid === puuid);
        if (!participant || participant.championId !== currentChampionId) {
          return null;
        }

        return {
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          win: participant.win,
          kills: participant.kills || 0,
          deaths: participant.deaths || 0,
          assists: participant.assists || 0,
          itemBuild: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6
          ].filter(item => item && item !== 0), // Remove empty item slots
          damageDealt: participant.totalDamageDealtToChampions || 0,
          goldEarned: participant.goldEarned || 0,
          role: participant.role || '',
          lane: participant.lane || ''
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null);

    // Analyze item builds
    const itemFrequency: { [key: string]: { count: number; winCount: number } } = {};
    championMatches.forEach(match => {
      match.itemBuild.forEach(itemId => {
        if (!itemFrequency[itemId]) {
          itemFrequency[itemId] = { count: 0, winCount: 0 };
        }
        itemFrequency[itemId].count++;
        if (match.win) {
          itemFrequency[itemId].winCount++;
        }
      });
    });

    return {
      championId: currentChampionId,
      matchCount: championMatches.length,
      wins: championMatches.filter(m => m.win).length,
      totalKills: championMatches.reduce((sum, m) => sum + m.kills, 0),
      totalDeaths: championMatches.reduce((sum, m) => sum + m.deaths, 0),
      totalAssists: championMatches.reduce((sum, m) => sum + m.assists, 0),
      totalDamageDealt: championMatches.reduce((sum, m) => sum + m.damageDealt, 0),
      totalGoldEarned: championMatches.reduce((sum, m) => sum + m.goldEarned, 0),
      matches: championMatches,
      commonItems: itemFrequency
    };
  } catch (error) {
    console.error('Error in analyzeChampionPerformance:', error);
    throw error;
  }
};

export const analyzeLiveGame = async (liveGame: LiveGame, region: string): Promise<LiveGameAnalysis> => {
  console.log('Starting live game analysis...');

  // Analyze each participant's champion performance
  const participantAnalyses = await Promise.all(
    liveGame.participants.map(async participant => {
      try {
        console.log(`Analyzing ${participant.summonerName} playing champion ${participant.championId}`);
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
    gameId: liveGame.gameId,
    gameMode: liveGame.gameMode,
    participants: participantAnalyses
  };
};