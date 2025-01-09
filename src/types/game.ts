// src/types/game.ts

export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string;
  }
  
  export interface LiveGameParticipant {
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    summonerName: string;
    bot: boolean;
    summonerId: string;
    gameCustomizationObjects: { category: string; content: string }[];
    perks: {
      perkIds: number[];
      perkStyle: number;
      perkSubStyle: number;
    };
    // Item slots
    item0?: number;
    item1?: number;
    item2?: number;
    item3?: number;
    item4?: number;
    item5?: number;
    item6?: number;  // Trinket slot
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
  
  export interface ApiResponse {
    account: Account;
    summoner: {
      id: string;
      accountId: string;
      puuid: string;
      name: string;
      profileIconId: number;
      revisionDate: number;
      summonerLevel: number;
    };
    liveGame: LiveGame | null;
  }

  export interface ItemData {
    name: string;
    description: string;
    colloq: string;
    plaintext: string;
    gold: {
      base: number;
      purchasable: boolean;
      total: number;
      sell: number;
    };
    tags: string[];
    maps: Record<string, boolean>;
    stats: Record<string, number>;
    depth?: number;
    into?: string[];
    from?: string[];
  }