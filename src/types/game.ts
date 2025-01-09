// src/types/game.ts

export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string;
  }
  
  export interface Summoner {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
  }
  
  export interface Participant {
    teamId: number;
    summonerId: string;
    summonerName: string;
    championId: number;
    spell1Id: number;
    spell2Id: number;
  }
  
  export interface LiveGame {
    gameId: number;
    gameType: string;
    gameMode: string;
    participants: Participant[];
  }
  
  export interface GameData {
    account: Account;
    summoner: Summoner;
    liveGame: LiveGame | null;
    message: string;
  }