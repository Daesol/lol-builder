export interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface LiveGameParticipant {
  riotIdGameName: string;  // Add this
  riotIdTagline: string; 
  riotId: string;
  puuid: string;
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
  championName?: string;
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
export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface MatchParticipant {
  lane: string;
  role: string;
  teamPosition: string;
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
  visionScore: number;
  win: boolean;
}

export interface TeamInfo {
  teamId: number;
  win: boolean;
  baronKills: number;
  dragonKills: number;
  towerKills: number;
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
  teams: TeamInfo[];
}

export interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: MatchInfo;
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

export interface ApiResponse {
  account: Account;
  summoner: Summoner;
  liveGame: LiveGame | null;
  lastMatch: Match | null;
  region: string;
}

export interface ChampionAnalysisParticipant {
  puuid: string;        // This will be the summonerId in our case
  summonerId: string;
  summonerName: string;
  championId: number;
  teamId: number;
}

export interface ChampionAnalysisProps {
  participant: ChampionAnalysisParticipant;
  region: string;
}

export interface ChampionPerformance {
  championId: number;
  matchCount: number;
  wins: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalDamageDealt: number;
  totalGoldEarned: number;
  matches: Array<{
    matchId: string;
    gameCreation: number;
    gameDuration: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    itemBuild: number[];
    damageDealt: number;
    goldEarned: number;
    role: string;
    lane: string;
  }>;
  commonItems: {
    [key: string]: {
      count: number;
      winCount: number;
    };
  };
}
export interface LiveGameAnalysis {
  timestamp: number;
  gameId: number;
  gameMode: string;
  participants: Array<{
    summonerId: string;
    summonerName: string;
    championId: number;
    teamId: number;
    championAnalysis: ChampionPerformance;
  }>;
}