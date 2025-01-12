// src/lib/riotApiClient.ts
import type { 
  Account, 
  Summoner, 
  Match, 
  LiveGame,
  ChampionPerformance
} from '@/types/game';
import { RateLimit } from './rateLimit';
import { analyzeLiveGame } from './performanceAnalyzer';

interface RequestOptions {
  method?: string;
  retries?: number;
  region?: string;
}

// Create rate limiter instance
const rateLimit = new RateLimit();

// Cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

const makeRiotRequest = async (
  url: string, 
  options: RequestOptions = {}
): Promise<any> => {
  const cacheKey = url;
  const cachedResponse = responseCache.get(cacheKey);
  
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
    return cachedResponse.data;
  }

  return rateLimit.enqueue(async () => {
    try {
      const apiKey = process.env.RIOT_API_KEY;
      if (!apiKey) {
        throw new Error('RIOT_API_KEY is not configured');
      }

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'X-Riot-Token': apiKey
        }
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
        console.warn(`Rate limit exceeded, retry after ${retryAfter}s`);
        throw new Error('RATE_LIMIT');
      }

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        console.error('Failed to parse response:', text);
        throw new Error('INVALID_JSON');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'RATE_LIMIT') {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.message === 'INVALID_JSON') {
          throw new Error('Invalid response from Riot API.');
        }
      }
      throw error;
    }
  });
};

// Helper for regional routing
const getRegionalRoute = (region: string): string => {
  const region_lower = region.toLowerCase();
  if (region_lower.includes('na')) return 'americas';
  if (region_lower.includes('euw')) return 'europe';
  if (region_lower.includes('kr')) return 'asia';
  return 'americas';
};

// API Functions using types from game.ts
export const getAccountData = async (summonerName: string, tagLine: string): Promise<Account> => {
  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
  const data = await makeRiotRequest(url);
  if (!data) throw new Error('Account not found');
  return data as Account;
};

export const getSummonerData = async (puuid: string, region: string): Promise<Summoner> => {
  const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const data = await makeRiotRequest(url, { region });
  if (!data) throw new Error('Summoner not found');
  return data as Summoner;
};

export const getLiveGameData = async (summonerId: string, region: string): Promise<LiveGame | null> => {
  const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${summonerId}`;
  return makeRiotRequest(url, { region });
};

export const getParticipantMatchHistory = async (
  puuid: string, 
  region: string, 
  count: number = 20
): Promise<string[]> => {
  const regionalRoute = getRegionalRoute(region);
  const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  
  const data = await makeRiotRequest(url, { region });
  if (!data || !Array.isArray(data)) return [];
  return data as string[];
};

export const getMatchDetails = async (matchId: string, region: string): Promise<Match | null> => {
  const regionalRoute = getRegionalRoute(region);
  const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  
  try {
    const data = await makeRiotRequest(url, { region });
    if (!data) return null;
    return data as Match;
  } catch (error) {
    console.error(`Failed to fetch match ${matchId}:`, error);
    throw error;
  }
};

// Re-export analyzeLiveGame and provide an alias for getMatchIds
export { analyzeLiveGame };
export { getParticipantMatchHistory as getMatchIds };