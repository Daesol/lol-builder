export interface MatchData {
  account: {
    puuid: string;
    gameName: string;
    tagLine: string;
  };
  summoner: {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
  };
  liveGame: {
    gameId: number;
    gameType: string;
    gameStartTime: number;
    mapId: number;
    gameLength: number;
    platformId: string;
    gameMode: string;
    participants: Array<{
      teamId: number;
      spell1Id: number;
      spell2Id: number;
      championId: number;
      profileIconId: number;
      summonerName: string;
      bot: boolean;
      summonerId: string;
      gameCustomizationObjects: Array<{
        category: string;
        content: string;
      }>;
      perks: {
        perkIds: number[];
        perkStyle: number;
        perkSubStyle: number;
      };
    }>;
  } | null;
  lastMatch: {
    gameId: string;
    // Add other match properties as needed
  } | null;
  region: string;
}

export interface PlayerAnalysis {
  kda: {
    kills: number;
    deaths: number;
    assists: number;
    ratio: number;
  };
  itemBuilds: {
    mostCommon: number[];
    winningBuilds: number[];
  };
  runes: {
    primaryTree: number;
    secondaryTree: number;
    keystone: number;
  };
} 