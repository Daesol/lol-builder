// lib/api/riot.ts
import { RateLimit } from '../utils/cache';
import type { Account, Match, LiveGame, Summoner } from '@/types/game';

const rateLimit = new RateLimit();

export class RiotAPI {
  private apiKey: string;
  private baseUrls: Record<string, string>;
  
  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';
    this.baseUrls = {
      americas: 'https://americas.api.riotgames.com',
      asia: 'https://asia.api.riotgames.com',
      europe: 'https://europe.api.riotgames.com'
    };
  }

  private async fetch<T>(url: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Riot API key is not configured');
    }

    await rateLimit.waitForAvailability();
    const response = await fetch(`${url}?api_key=${this.apiKey}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
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

  async getLiveGame(puuid: string, region: string): Promise<LiveGame | null> {
    try {
      const url = `${this.baseUrls[region]}/lol/spectator/v5/active-games/by-summoner/${puuid}`;
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

  async getMatchHistory(puuid: string, region: string, count: number = 3): Promise<string[]> {
    try {
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
      return this.fetch<string[]>(url);
    } catch (error) {
      console.error('Error fetching match history:', error);
      return [];
    }
  }

  async getMatch(matchId: string, region: string): Promise<Match | null> {
    try {
      const routingRegion = this.getRoutingValue(region);
      const url = `${this.baseUrls[routingRegion]}/lol/match/v5/matches/${matchId}`;
      return this.fetch<Match>(url);
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
  }

  private getRoutingValue(region: string): string {
    switch (region.toUpperCase()) {
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