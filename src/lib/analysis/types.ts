// src/lib/analysis/types.ts

export interface PlayerMatchStats {
    championId: number;
    championName: string;
    kills: number;
    deaths: number;
    assists: number;
    items: number[];
    win: boolean;
    gameMode: string;
    gameDuration: number;
  }
  
  export interface PlayerAnalysis {
    averageKDA: {
      kills: number;
      deaths: number;
      assists: number;
    };
    commonItems: {
      itemId: number;
      frequency: number;
    }[];
    winRate: number;
    playstyle: {
      aggressive: number;    // 0-1 score
      teamfight: number;     // 0-1 score
      objective: number;     // 0-1 score
    };
  }
  
  export interface TeamComp {
    damage: {
      physical: number;
      magic: number;
      true: number;
    };
    crowdControl: number;    // 0-1 score
    engage: number;         // 0-1 score
    poke: number;          // 0-1 score
  }
  
  export interface ItemRecommendation {
    core: number[];        // Core item IDs
    situational: number[]; // Situational item IDs
    offensive: number[];   // Offensive options
    defensive: number[];   // Defensive options
    reasoning: string;     // LLM explanation
    buildOrder: string;    // Building order explanation
    playstyleAdvice: string; // How to play with this build
  }