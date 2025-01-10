// src/components/ItemRecommender/types.ts

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
    participant: LiveGameParticipant;
  }
  
  // Live Game Display Types
  export interface LiveGameDisplayProps {
    liveGame: LiveGame;
  }
  
  // Import types we reference from game.ts
  import type { LiveGame, LiveGameParticipant } from '@/types/game';
  
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
    buildPath: number[];  // Item IDs this item builds from
    buildsInto: number[]; // Item IDs this item builds into
  }