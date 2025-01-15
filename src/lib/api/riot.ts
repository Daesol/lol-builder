// lib/api/riot.ts
import { rateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

export class RiotAPI {
  private apiKey: string;
  private baseUrls: Record<string, string>;
  
  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';
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

  private async fetch<T>(url: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Riot API key is not configured');
    }

    await rateLimit.waitForAvailability();
    
    // Log the full URL for debugging (without API key)
    console.log('Making Riot API request to:', url);
    
    const response = await fetch(`${url}?api_key=${this.apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Check for rate limit errors
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        console.error('Rate limit exceeded:', {
          retryAfter,
          method: 'GET',
          url: url.split('?')[0], // Log URL without API key
          rateLimitType: response.headers.get('X-Rate-Limit-Type'),
          error: errorText
        });
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      }
      
      // Log other errors
      console.error('Riot API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.split('?')[0],
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
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
    // Summoner v4 API uses platform routing values
    const url = `${this.baseUrls[region.toUpperCase()]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const result = await this.fetch<Summoner>(url);
    if (!result) {
      throw new Error('Summoner not found');
    }
    return result;
  }

  async getLiveGame(summonerId: string, region: string): Promise<LiveGame | null> {
    try {
      // Spectator v4 API uses platform routing values
      const url = `${this.baseUrls[region.toUpperCase()]}/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
      const result = await this.fetch<LiveGame>(url);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        // 404 means player not in game (expected)
        if (error.message.includes('404')) {
          return null;
        }
        // 403 means API key permissions issue
        if (error.message.includes('403')) {
          console.error('Spectator API access denied - check API key permissions');
          console.log('Note: Spectator API requires a development key or production key with proper permissions');
          return null; // Return null instead of throwing to allow the app to continue
        }
      }
      throw error;
    }
  }

  async getMatchHistory(puuid: string, region: string, count: number = 3): Promise<string[]> {
    try {
      // Match v5 API uses regional routing values
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
      return this.fetch<string[]>(`${url}?count=${count}`);
    } catch (error) {
      console.error('Error fetching match history:', error);
      return [];
    }
  }

  async getMatch(matchId: string, region: string): Promise<Match | null> {
    try {
      // Match v5 API uses regional routing values
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/${matchId}`;
      return this.fetch<Match>(url);
    } catch (error) {
      console.error('Error fetching match:', error);
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