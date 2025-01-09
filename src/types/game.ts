// src/types/game.ts

// Account related types
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
  
  // Live game related types
  interface GameCustomizationObject {
    category: string;
    content: string;
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
    gameCustomizationObjects: GameCustomizationObject[];
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
  
  // Match history related types
  export interface MatchParticipant {
    summonerName: string;
    kills: number;
    deaths: number;
    assists: number;
    items: number[];  // Changed from optional since Riot API always provides these
    championId: number;
    teamId: number;
    gold?: number;     // This can be optional as it might be calculated
    lane?: string;     // Additional useful fields
    role?: string;
    championName?: string;
  }
  
  export interface MatchInfo {
    gameCreation: number;
    gameDuration: number;
    gameId: number;
    gameMode: string;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: MatchParticipant[];
    platformId: string;
    queueId: number;
  }
  
  export interface MatchData {
    metadata: {
      matchId: string;
      participants: string[];  // Array of PUUIDs
    };
    info: MatchInfo;
  }
  
  // API Response type
  export interface ApiResponse {
    account: Account;
    summoner: Summoner;
    liveGame: LiveGame | null;
    matchHistory?: MatchData[];  // Added in case you want to fetch match history later
  }