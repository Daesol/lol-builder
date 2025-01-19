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
  blueTeam: ParticipantAnalysis[];
  redTeam: ParticipantAnalysis[];
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
  puuid: string;
  championId: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  goldEarned: number;
  win: boolean;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  role: string;
  teamPosition: string;
  lane: string;
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
  info: {
    gameId: number;
    gameCreation: number;
    gameDuration: number;
    participants: MatchParticipant[];
  };
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  gold: {
    base: number;
    total: number;
    sell: number;
  };
  image: {
    full: string;
  };
}

export interface ApiResponse {
  account: Account;
  liveGame: LiveGame | null;
  summoner: {
    name: string;
    summonerLevel: number;
  };
  region: string;
  lastMatch: Match | null;
}

export interface ParticipantAnalysis {
  puuid: string;
  teamId: number;
  gameName: string;
  tagLine: string;
  championId: number;
  championName: string;
  analysis: ChampionPerformance;
}

export interface ChampionAnalysisParticipant {
  puuid: string;
  summonerId: string;
  summonerName: string;
  championId: number;
  teamId: number;
}

export interface ChampionAnalysisProps {
  participant: ParticipantAnalysis;
  analysis: ChampionPerformance;
}

export interface ChampionPerformance {
  matchCount: number;
  championMatchCount: number;
  wins: number;
  championWins: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalDamageDealt: number;
  championStats: {
    kills: number;
    deaths: number;
    assists: number;
    damageDealt: number;
  };
  commonItems: Record<number, { count: number; winCount: number }>;
  commonRunes: {
    primaryTree: number;
    primaryRunes: Record<number, { count: number }>;
    secondaryTree: number;
    secondaryRunes: Record<number, { count: number }>;
  };
}

export interface LiveGameAnalysis {
  blueTeam: ParticipantAnalysis[];
  redTeam: ParticipantAnalysis[];
}

export interface ChampionData {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  tags: string[];
  partype: string;
  stats: {
    hp: number;
    hpperlevel: number;
    mp: number;
    mpperlevel: number;
    movespeed: number;
    armor: number;
    armorperlevel: number;
    spellblock: number;
    spellblockperlevel: number;
    attackrange: number;
    hpregen: number;
    hpregenperlevel: number;
    mpregen: number;
    mpregenperlevel: number;
    crit: number;
    critperlevel: number;
    attackdamage: number;
    attackdamageperlevel: number;
    attackspeedperlevel: number;
    attackspeed: number;
  };
}

export type ChampionsData = {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionData>;
};