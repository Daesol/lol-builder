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
      europe: 'https://europe.api.riotgames.com',
      NA1: 'https://na1.api.riotgames.com',
      EUW1: 'https://euw1.api.riotgames.com',
      KR: 'https://kr.api.riotgames.com'
    };
  }

  private async fetch(url: string): Promise<any> {
    await rateLimit.wait();
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': this.apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getAccountData(summonerName: string, tagLine: string): Promise<Account> {
    const url = `${this.baseUrls.americas}/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagLine}`;
    return this.fetch(url);
  }

  async getSummonerByPUUID(puuid: string, region: string): Promise<Summoner> {
    const url = `${this.baseUrls[region]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return this.fetch(url);
  }

  async getLiveGame(summonerId: string, region: string): Promise<LiveGame | null> {
    try {
      const url = `${this.baseUrls[region]}/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
      return await this.fetch(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getMatchHistory(puuid: string, region: string, count: number): Promise<Match[]> {
    const platform = this.getPlatformRoute(region);
    const matchIds = await this.fetch(
      `${this.baseUrls[platform]}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
    );

    return Promise.all(
      matchIds.map((matchId: string) => 
        this.fetch(`${this.baseUrls[platform]}/lol/match/v5/matches/${matchId}`)
      )
    );
  }

  private getPlatformRoute(region: string): string {
    switch (region) {
      case 'NA1':
      case 'BR1':
      case 'LA1':
      case 'LA2':
        return 'americas';
      case 'EUW1':
      case 'EUN1':
      case 'TR1':
      case 'RU':
        return 'europe';
      case 'KR':
      case 'JP1':
        return 'asia';
      default:
        return 'americas';
    }
  }
}

export const riotApi = new RiotAPI();