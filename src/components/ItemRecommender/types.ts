// Centralized types for consistency
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
  
// Common fields between LiveGameParticipant and MatchParticipant
export interface ParticipantBase {
    summonerName: string;
    championId: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    items: number[]; // Unified items array
    teamId?: number;
  }
  
  // Extend for live game participants
  export interface LiveGameParticipant extends ParticipantBase {
    profileIconId: number;
    bot: boolean;
    summonerId: string;
    perks: {
      perkIds: number[];
      perkStyle: number;
      perkSubStyle: number;
    };
  }
  
  // Extend for match participants
  export interface MatchParticipant extends ParticipantBase {
    puuid: string;
    championName: string;
    win: boolean;
  }
  
  // Update other types as necessary
  
  
  export interface LiveGame {
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId?: number;
    participants: LiveGameParticipant[];
    observers?: { encryptionKey: string };
    platformId?: string;
    bannedChampions?: {
      championId: number;
      teamId: number;
      pickTurn: number;
    }[];
    gameStartTime?: number;
    gameLength?: number;
  }
  
  
  
  export interface MatchInfo {
    gameId: number;
    gameDuration: number;
    participants: MatchParticipant[];
  }
  
  export interface ApiResponse {
    account: Account;
    summoner: Summoner;
    liveGame?: LiveGame | null;
    lastMatch?: MatchInfo | null;
    message: string;
  }
  