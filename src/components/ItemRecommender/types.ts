// Import necessary types from shared sources
import type { LiveGame, LiveGameParticipant } from '@/types/game';

// Search Section Types
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

// Item Slots Types
export interface ItemSlotsProps {
  items?: number[];
}

// Participant Card Types
export interface ParticipantCardProps {
  participant: LiveGameParticipant | MatchParticipant; // Can handle both live and match data
  isLiveGame?: boolean; // Add a flag to distinguish between live and match data
}

// Live Game Display Types
export interface LiveGameDisplayProps {
  liveGame: LiveGame;
}

// Last Match Display Types
export interface LastMatchDisplayProps {
  matchInfo: MatchInfo;
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

// Champion Types (for future use)
export interface ChampionData {
  id: number;
  name: string;
  role: string;
  damageType: 'physical' | 'magic' | 'mixed';
  buildType: 'ad' | 'ap' | 'tank' | 'support';
}

// Item Types (for future use)
export interface ItemData {
  id: number;
  name: string;
  cost: number;
  stats: Record<string, number>;
  tags: string[];
  buildPath: number[]; // Item IDs this item builds from
  buildsInto: number[]; // Item IDs this item builds into
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
    gameCreation: number;
    gameDuration: number;
    gameId: number;
    gameMode: string;
    gameType: string;
    mapId: number;
    participants: MatchParticipant[];
  }
  
