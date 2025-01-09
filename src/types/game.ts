// src/types/game.ts

export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string;
  }
  
  export interface MatchParticipant {
    summonerName: string;
    kills: number;
    deaths: number;
    assists: number;
    items: number[];
  }
  
  export interface ApiResponse {
    account: Account;
    matchInfo: MatchParticipant[];
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