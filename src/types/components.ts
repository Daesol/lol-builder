// src/types/components.ts

import { LiveGame, Summoner } from './game';

export interface ItemRecommendation {
  id: number;
  name: string;
  description: string;
  priority: 'core' | 'situational' | 'optional';
  cost: number;
  imageUrl: string;
}

export interface BuildPath {
  items: ItemRecommendation[];
  totalCost: number;
  buildOrder: string[];
}

export interface GameInfo {
  summoner: Summoner;
  liveGame: LiveGame | null;
  recommendations: {
    buildPath: BuildPath;
    alternativeItems: ItemRecommendation[];
  } | null;
}
