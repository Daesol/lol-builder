// lib/api/riot.ts
import { RateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

const rateLimit = new RateLimit();

export class RiotAPI {
  private apiKey: string;
  private baseUrls: Record<string, string>;
  
  constructor() {
    // Only initialize on server-side
    if (typeof window === 'undefined') {
      const apiKey = process.env.RIOT_API_KEY;
      if (!apiKey) {
        console.error('Environment variables:', {
          RIOT_API_KEY: process.env.RIOT_API_KEY,
          NODE_ENV: process.env.NODE_ENV,
        });
        throw new Error('RIOT_API_KEY is not set in environment variables');
      }
      this.apiKey = apiKey;
    } else {
      // Client-side: API calls should go through Next.js API routes
      this.apiKey = '';
    }
    
    this.baseUrls = {
      americas: 'https://americas.api.riotgames.com',
      asia: 'https://asia.api.riotgames.com',
      europe: 'https://europe.api.riotgames.com',
      NA1: 'https://na1.api.riotgames.com',
      EUW1: 'https://euw1.api.riotgames.com',
      KR: 'https://kr.api.riotgames.com'
    };
  }

  private async fetch<T>(url: string): Promise<T | null> {
    await rateLimit.wait();
    
    console.log('Making API request to:', url);
    console.log('Using API key:', this.apiKey.substring(0, 8) + '...');
    
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No error body');
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorBody
      });

      if (response.status === 403) {
        throw new Error('Invalid or expired API key. Please check your RIOT_API_KEY environment variable.');
      }

      if (response.status === 404) {
        return null;
      }

      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async getAccountData(gameName: string, tagLine: string): Promise<Account> {
    const url = `${this.baseUrls.americas}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const result = await this.fetch<Account>(url);
    if (!result) {
      throw new Error('Account not found');
    }
    return result;
  }

  async getSummonerByPUUID(puuid: string, region: string): Promise<Summoner> {
    const url = `${this.baseUrls[region]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const result = await this.fetch<Summoner>(url);
    if (!result) {
      throw new Error('Summoner not found');
    }
    return result;
  }

  async getLiveGame(summonerId: string, region: string): Promise<LiveGame | null> {
    try {
      const url = `${this.baseUrls[region]}/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
      const result = await this.fetch<LiveGame>(url);
      return result;
    } catch (error) {
      // 404 means player not in game (expected)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // 403 means API key permissions issue
      if (error instanceof Error && error.message.includes('403')) {
        console.error('Spectator API access denied - check API key permissions');
        return null;
      }
      throw error;
    }
  }

  async getMatchHistory(puuid: string, region: string, count: number = 20): Promise<Match[]> {
    const platform = this.getPlatformFromRegion(region);
    const url = `${this.baseUrls[platform]}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    const matchIds = await this.fetch<string[]>(url);
    if (!matchIds) {
      return [];
    }
    
    return Promise.all(
      matchIds.map((matchId: string) => this.getMatch(matchId, platform))
    );
  }

  async getMatch(matchId: string, platform: string): Promise<Match> {
    const url = `${this.baseUrls[platform]}/lol/match/v5/matches/${matchId}`;
    const result = await this.fetch<Match>(url);
    if (!result) {
      throw new Error('Match not found');
    }
    return result;
  }

  private getPlatformFromRegion(region: string): string {
    switch (region) {
      case 'NA1':
      case 'BR1':
      case 'LA1':
      case 'LA2':
        return 'americas';
      case 'KR':
      case 'JP1':
        return 'asia';
      case 'EUW1':
      case 'EUN1':
      case 'TR1':
      case 'RU':
        return 'europe';
      default:
        return 'americas';
    }
  }
}

export const riotApi = new RiotAPI();