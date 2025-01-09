// src/types/game.ts

export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string;
  }
  
export interface Participant {
    summonerName: string;
    kills: number;
    deaths: number;
    assists: number;
    items?: number[];  // Make items optional
    championId?: number;
    teamId?: number;
    gold?: number;     // Add gold to track purchasing power
  }
  
  export interface MatchInfo {
    participants: Participant[];
    gameMode?: string;
    gameType?: string;
  }
  
  export interface MatchData {
    info: MatchInfo;
    metadata?: {
      matchId: string;
    };
  }
  
  export interface ApiResponse {
    account: Account;
    matchInfo: Participant[];
    recentMatchId: string;
    summoner: {
      accountId: string;
      id: string;
      profileIconId: number;
      puuid: string;
      revisionDate: number;
      summonerLevel: number;
    };
  }