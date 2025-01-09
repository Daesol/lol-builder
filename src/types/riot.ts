// src/types/riot.ts

export interface Summoner {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
  }
  
  export interface LiveGameParticipant {
    teamId: number;
    summonerId: string;
    summonerName: string;
    championId: number;
  }
  
  export interface LiveGame {
    gameId: number;
    gameType: string;
    gameMode: string;
    participants: LiveGameParticipant[];
  }
  
  export interface GameData {
    summoner: Summoner;
    liveGame: LiveGame | null;
    message: string;
  }