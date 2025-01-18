// lib/api/riot.ts
import { rateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

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

  private async fetch<T>(url: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Riot API key is not configured');
    }

    await rateLimit.waitForAvailability();
    
    // Add API key to params
    const queryParams = new URLSearchParams({
      ...params,
      api_key: this.apiKey
    });
    
    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
    
    try {
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Enhanced error logging
        console.error('API Error Details:', {
          endpoint: url.split('/v5/')[1] || url,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        });

        switch (response.status) {
          case 404:
            return null as T;
          case 500:
            console.warn('Riot API server error, data might be unavailable:', {
              url: url.split('?')[0],
              timestamp: new Date().toISOString()
            });
            return null as T;
          default:
            throw new Error(`API request failed (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Add request context to error
        error.message = `${error.message} (URL: ${url.split('?')[0]})`;
      }
      throw error;
    }
  }

  async getAccountData(gameName: string, tagLine: string): Promise<Account> {
    try {
      // For Riot ID lookups, we need to use the account-v1 endpoint
      const url = `${this.baseUrls.AMERICAS}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      console.log('Looking up account:', { gameName, tagLine });
      const result = await this.fetch<Account>(url);
      if (!result) {
        throw new Error('Account not found');
      }
      return result;
    } catch (error) {
      console.error('Error in getAccountData:', error);
      throw error;
    }
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
    try {
      // Spectator v5 uses PUUID instead of summoner ID
      const url = `${this.baseUrls[region.toUpperCase()]}/lol/spectator/v5/active-games/by-summoner/${puuid}`;
      console.log('Spectator API Request:', {
        endpoint: 'spectator-v5',
        region: region.toUpperCase(),
        url: url.split('?')[0]
      });
      return await this.fetch<LiveGame>(url);
    } catch (error) {
      if (error instanceof Error) {
        // 404 means player not in game (expected)
        if (error.message.includes('404')) {
          return null;
        }
        // 403 means API key permissions issue
        if (error.message.includes('403')) {
          console.error('Spectator API access denied - check API key permissions');
          return null;
        }
        // 400 means wrong parameter type
        if (error.message.includes('400')) {
          console.error('Invalid parameter type for Spectator API');
          return null;
        }
      }
      throw error;
    }
  }

  async getMatchHistory(puuid: string, region: string, count: number = 3): Promise<string[]> {
    try {
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
      const params = { count: count.toString() };

      const result = await this.fetch<string[]>(url, params);
      
      // Filter out any null or undefined values
      return (result || []).filter(Boolean);
    } catch (error) {
      console.error('Match History Error:', {
        error,
        puuid: puuid.substring(0, 8) + '...',
        region,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }

  async getMatch(matchId: string, region: string): Promise<Match | null> {
    try {
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/${matchId}`;
      
      console.log('Match API Request:', {
        matchId,
        region: routingRegion,
        timestamp: new Date().toISOString()
      });

      return await this.fetch<Match>(url);
    } catch (error) {
      // Log specific error details
      console.error('Match Details Error:', {
        error,
        matchId,
        region,
        errorType: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Return null for any error to prevent breaking the UI
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
}

export const riotApi = new RiotAPI();