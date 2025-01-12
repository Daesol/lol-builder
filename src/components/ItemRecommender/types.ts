// src/components/ItemRecommender/types.ts

// Import types we reference from game.ts
import type { LiveGame, LiveGameParticipant } from '@/types/game';

export interface SearchSectionProps {
    summonerName: string;
    tagLine: string;
    region: string;
    loading: boolean;
    onSummonerNameChange: (value: string) => void;
    onTagLineChange: (value: string) => void;
    onRegionChange: (value: string) => void;
    onSearch: () => void;
}

// Item Related Types
export interface ItemSlotsProps {
  items?: number[];
  tooltipSuffix?: (itemId: number) => string;
}

export interface ItemStats {
  count: number;
  winCount: number;
}

export interface ItemData {
  id: number;
  name: string;
  cost: number;
  stats: Record<string, number>;
  tags: string[];
  buildPath: number[];  // Item IDs this item builds from
  buildsInto: number[]; // Item IDs this item builds into
}

// Participant and Game Types
export interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
  matchStats?: MatchStats;
  enableAnalysis?: boolean;
  initialAnalysis?: ChampionPerformance;
}

export interface LiveGameDisplayProps {
  liveGame: LiveGame;
}

export interface MatchStats {
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  goldEarned: number;
  win: boolean;
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
  commonItems: Record<string, ItemStats>;
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
}

// Analysis Types (for future use with LLM)
export interface ItemAnalysis {
  recommendedItems: number[];
  reasoning: string;
  buildPath: string[];
  counterItems: number[];
}

export interface TeamAnalysis {
  teamComposition: string;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
}

export interface GameAnalysis {
  itemAnalysis: ItemAnalysis;
  teamAnalysis: TeamAnalysis;
  gamePhase: 'early' | 'mid' | 'late';
  recommendations: string[];
}

// Champion Types
export interface ChampionData {
  id: number;
  name: string;
  role: string;
  damageType: 'physical' | 'magic' | 'mixed';
  buildType: 'ad' | 'ap' | 'tank' | 'support';
}