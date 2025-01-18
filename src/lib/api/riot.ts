// lib/api/riot.ts
import { rateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

export interface AnalysisProgressData {
  total: number;
  current: number;
  completed: boolean;
  error?: string;
  matchesProcessed: number;
  matchesSkipped: number;
}

export class RiotAPI {
  private apiKey: string;
  private baseUrls: Record<string, string>;
  
  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';
    
    // Enhanced API key validation
    if (!this.apiKey.startsWith('RGAPI-')) {
      console.error('Invalid API key format. Key should start with RGAPI-');
    } else {
      console.log('API Key validation:', {
        format: 'Valid (RGAPI- prefix)',
        length: this.apiKey.length,
        lastUpdated: new Date().toISOString()
      });
    }
    
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
    console.log('Making API request:', url);
    await rateLimit.waitForAvailability();
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async getAccountData(gameName: string, tagLine: string): Promise<Account> {
    console.log('Fetching account data:', { gameName, tagLine });
    const url = `${this.baseUrls['AMERICAS']}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const result = await this.fetch<Account>(url);
    if (!result) {
      throw new Error('Account not found');
    }
    console.log('Account data received:', result);
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
    const platform = this.getPlatformFromRegion(region);
    const url = `${this.baseUrls[platform]}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    const result = await this.fetch<string[]>(url);
    console.log('Match history received:', result);
    return result || [];
  }

  async getMatch(
    matchId: string, 
    region: string, 
    onProgress?: (progress: AnalysisProgressData) => void
  ): Promise<Match | null> {
    try {
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/${matchId}`;
      
      if (onProgress) {
        onProgress({
          total: 1,
          current: 0,
          completed: false,
          matchesProcessed: 0,
          matchesSkipped: 0
        });
      }

      const result = await this.fetch<Match>(url);
      
      if (onProgress) {
        onProgress({
          total: 1,
          current: 1,
          completed: true,
          matchesProcessed: result ? 1 : 0,
          matchesSkipped: result ? 0 : 1
        });
      }

      return result;
    } catch (error) {
      console.warn('Match fetch failed:', {
        matchId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (onProgress) {
        onProgress({
          total: 1,
          current: 1,
          completed: true,
          error: 'Failed to fetch match data',
          matchesProcessed: 0,
          matchesSkipped: 1
        });
      }
      
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
}

export const riotApi = new RiotAPI();