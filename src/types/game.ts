// src/types/game.ts

export interface Participant {
    summonerId: string;
    summonerName: string;
    championId: number;
    teamId: number;
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
    summoner: {
      name: string;
      summonerLevel: number;
    };
    liveGame: LiveGame | null;
    message: string;
  }