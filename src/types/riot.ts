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
    spell1Id: number;
    spell2Id: number;
    championId: number;
    summonerId: string;
    summonerName: string;
    gameCustomizationObjects: any[];
    bot: boolean;
    perks: {
      perkIds: number[];
      perkStyle: number;
      perkSubStyle: number;
    };
  }
  
  export interface LiveGame {
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId: number;
    participants: LiveGameParticipant[];
    observers: {
      encryptionKey: string;
    };
    platformId: string;
    bannedChampions: {
      championId: number;
      teamId: number;
      pickTurn: number;
    }[];
    gameStartTime: number;
    gameLength: number;
  }
  