// lib/api/riot.ts
import { rateLimit, RateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

export interface AnalysisProgressData {
  total: number;
  current: number;
  completed: boolean;
  error?: string;
  matchesProcessed: number;
  matchesSkipped: number;
}

const ROUTING = {
  'NA1': 'americas',
  'BR1': 'americas',
  'LA1': 'americas',
  'LA2': 'americas',
  'KR': 'asia',
  'JP1': 'asia',
  'EUW1': 'europe',
  'EUN1': 'europe',
  'TR1': 'europe',
  'RU': 'europe',
  // ... add other regions as needed
} as const;

export class RiotAPI {
  private apiKeys: string[];
  private currentKeyIndex: number;
  private baseUrls: Record<string, string>;
  private rateLimits: Map<string, RateLimit>;  // One rate limiter per API key
  
  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys.filter(key => key.startsWith('RGAPI-'));
    this.currentKeyIndex = 0;
    this.rateLimits = new Map(
      apiKeys.map(key => [key, new RateLimit()])
    );
    
    if (this.apiKeys.length === 0) {
      throw new Error('No valid API keys provided');
    }
    
    console.log('API Keys configured:', {
      count: this.apiKeys.length,
      validKeys: this.apiKeys.map(key => ({
        format: 'Valid (RGAPI- prefix)',
        length: key.length
      }))
    });
    
    this.baseUrls = {
      // Platform routing values (regional APIs)
      BR1: 'https://br1.api.riotgames.com',
      EUN1: 'https://eun1.api.riotgames.com',
      EUW1: 'https://euw1.api.riotgames.com',
      JP1: 'https://jp1.api.riotgames.com',
      KR: 'https://kr.api.riotgames.com',
      LA1: 'https://la1.api.riotgames.com',
      LA2: 'https://la2.api.riotgames.com',
      NA1: 'https://na1.api.riotgames.com',
      OC1: 'https://oc1.api.riotgames.com',
      TR1: 'https://tr1.api.riotgames.com',
      RU: 'https://ru.api.riotgames.com',
      
      // Regional routing values
      AMERICAS: 'https://americas.api.riotgames.com',
      ASIA: 'https://asia.api.riotgames.com',
      EUROPE: 'https://europe.api.riotgames.com',
      SEA: 'https://sea.api.riotgames.com'
    };
  }

  private async fetch<T>(url: string): Promise<T | null> {
    // Try each API key until we get a successful response
    for (let attempt = 0; attempt < this.apiKeys.length * 2; attempt++) {
      const currentKey = this.apiKeys[this.currentKeyIndex];
      const currentLimiter = this.rateLimits.get(currentKey)!;
      
      try {
        await currentLimiter.waitForAvailability();
        
        const response = await fetch(url, {
          headers: {
            'X-Riot-Token': currentKey
          }
        });

        // Log detailed response info for debugging
        console.log('API Response:', {
          url: url.split('?')[0], // Hide query params
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          key: this.currentKeyIndex + 1
        });

        if (response.status === 429) {
          console.log(`Rate limit hit for key ${this.currentKeyIndex + 1}, rotating...`);
          this.rotateApiKey();
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        if (response.status === 500) {
          const errorText = await response.text();
          console.error('Riot API 500 error:', {
            url: url.split('?')[0],
            error: errorText,
            key: this.currentKeyIndex + 1
          });
          // Don't immediately retry on 500 errors
          throw new Error(`Riot API error: ${errorText}`);
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        console.error(`Request failed with key ${this.currentKeyIndex + 1}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: url.split('?')[0],
          attempt: attempt + 1
        });
        
        if (attempt === this.apiKeys.length * 2 - 1) {
          throw error;
        }
        
        this.rotateApiKey();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  private rotateApiKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
  }

  async getAccountData({ gameName, tagLine, region }: { 
    gameName: string; 
    tagLine: string;
    region: string;
  }): Promise<Account> {
    const routing = ROUTING[region as keyof typeof ROUTING] || 'americas';
    const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    
    const result = await this.fetch<Account>(url);
    if (!result) {
      throw new Error('Account not found');
    }
    return result;
  }

  async getSummonerByPUUID(puuid: string, region: string): Promise<Summoner> {
    try {
      // Changed from v5 back to v4 for summoner API
      const url = `${this.baseUrls[region.toUpperCase()]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      console.log('Summoner API Request:', {
        endpoint: 'summoner-v4',
        region: region.toUpperCase(),
        url: url.split('?')[0]
      });
      const result = await this.fetch<Summoner>(url);
      if (!result) {
        throw new Error('Summoner not found');
      }
      return result;
    } catch (error) {
      console.error('Error in getSummonerByPUUID:', error);
      throw error;
    }
  }

  async getLiveGame(puuid: string, region: string): Promise<LiveGame | null> {
    console.log('Fetching live game:', { puuid, region });
    try {
      // No need to fetch summoner data since v5 uses PUUID directly
      const url = `${this.baseUrls[region.toUpperCase()]}/lol/spectator/v5/active-games/by-summoner/${puuid}`;
      console.log('Spectator API Request:', {
        endpoint: 'spectator-v5',
        region: region.toUpperCase(),
        puuid,
        url: url
      });
      
      const result = await this.fetch<LiveGame>(url);
      
      if (!result) {
        console.log('Player not in active game');
        return null;
      }

      console.log('Live game data:', result);
      return result;
    } catch (error) {
      console.error('Live game fetch error:', error);
      throw error;
    }
  }

  async getMatchHistory(puuid: string, region: string, count: number): Promise<string[]> {
    console.log('Fetching match history:', { puuid, region, count });
    try {
      // Use regional routing for match history
      const routingValue = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingValue]}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
      
      console.log('Match history request:', {
        endpoint: 'match-v5',
        region: routingValue,
        url
      });
      
      const result = await this.fetch<string[]>(url);
      if (!result) {
        console.log('No match history found');
        return [];
      }
      
      console.log(`Found ${result.length} matches`);
      return result;
    } catch (error) {
      console.error('Failed to fetch match history:', error);
      return [];
    }
  }

  getMatchUrl(region: string, matchId: string): string {
    const routingValue = this.getRoutingValue(region);
    return `${this.baseUrls[routingValue]}/lol/match/v5/matches/${matchId}`;
  }

  async getMatch(matchId: string, region: string): Promise<Match | null> {
    try {
      const url = this.getMatchUrl(region, matchId);
      
      console.log('Match request:', {
        endpoint: 'match-v5',
        region: this.getRoutingValue(region),
        matchId,
        url
      });

      return this.fetch<Match>(url);
    } catch (error) {
      console.error('Match fetch failed:', {
        matchId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private getRoutingValue(region: string): string {
    // Updated regional routing mapping
    switch (region.toUpperCase()) {
      case 'NA1':
      case 'BR1':
      case 'LA1':
      case 'LA2':
      case 'OC1':
        return 'AMERICAS';
      case 'KR':
      case 'JP1':
        return 'ASIA';
      case 'EUW1':
      case 'EUN1':
      case 'TR1':
      case 'RU':
        return 'EUROPE';
      default:
        return 'AMERICAS';
    }
  }

  private getPlatformFromRegion(region: string): string {
    // Convert region to platform routing value
    switch (region.toUpperCase()) {
      case 'NA1':
      case 'BR1':
      case 'LA1':
      case 'LA2':
      case 'OC1':
        return 'AMERICAS';
      case 'KR':
      case 'JP1':
        return 'ASIA';
      case 'EUW1':
      case 'EUN1':
      case 'TR1':
      case 'RU':
        return 'EUROPE';
      default:
        return 'AMERICAS';
    }
  }

  // Add a method to handle sequential requests with rate limiting
  async fetchSequential<T>(urls: string[]): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    const batchSize = 2;  // Reduce batch size from 3 to 2
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(urls.length / batchSize)}`);
      
      try {
        // Process batch sequentially instead of in parallel
        for (const url of batch) {
          try {
            const result = await this.fetch<T>(url);
            results.push(result);
          } catch (error) {
            console.error('Request failed:', {
              url: url.split('?')[0],
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            results.push(null);
          }
        }
      } catch (error) {
        console.error('Batch processing failed:', error);
        results.push(...new Array(batch.length).fill(null));
      }
    }
    return results;
  }
}

// Initialize with multiple keys
const API_KEYS = [
  process.env.RIOT_API_KEY,
  process.env.RIOT_API_KEY_2,
  process.env.RIOT_API_KEY_3
].filter((key): key is string => typeof key === 'string');

export const riotApi = new RiotAPI(API_KEYS);