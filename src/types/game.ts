export interface Account {
    puuid: string;
    gameName: string;
    tagLine: string;
  }
  
  export interface LiveGameParticipant {
    kills: number;
    deaths: number;
    assists: number;
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
    item0?: number;
    item1?: number;
    item2?: number;
    item3?: number;
    item4?: number;
    item5?: number;
    item6?: number; // Trinket slot
    teamPosition: string;
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
    error: string;
    message: string;
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
  
  export interface MatchParticipant {
    puuid: string;
    summonerName: string;
    championId: number;
    championName: string;
    teamId: number;
    kills: number;
    deaths: number;
    assists: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    totalDamageDealtToChampions: number;
    goldEarned: number;
    win: boolean;
  }
  
  export interface MatchInfo {
    gameCreation: number; // Timestamp when the game started
    gameDuration: number; // Duration of the game in seconds
    gameId: number;       // Unique game ID
    gameMode: string;     // Game mode (e.g., CLASSIC, ARAM)
    gameType: string;     // Game type (e.g., MATCHED_GAME)
    gameVersion: string;  // Version of the game client
    mapId: number;        // Map ID (e.g., Summoner's Rift)
    participants: MatchParticipant[]; // List of participants in the game
    platformId: string;   // Platform ID (e.g., NA1, EUW1)
    queueId: number;      // Queue type (e.g., ranked, normal)
    teams: {
      teamId: number;     // Team ID (100 for Blue, 200 for Red)
      win: boolean;       // Did the team win?
      baronKills: number;
      dragonKills: number;
      towerKills: number;
    }[];                  // Summary of team stats
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
  