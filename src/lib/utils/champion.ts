import championsData from '@/data/champions.json';
import type { ChampionsData } from '@/types/game';

const champions = (championsData as ChampionsData).data;
let championMapping: Record<number, string> = {};

export function initChampionMapping() {
  championMapping = Object.values(champions).reduce((acc, champion) => {
    acc[parseInt(champion.key)] = champion.id;
    return acc;
  }, {} as Record<number, string>);
}

export function getChampionName(championId: number): string {
  return championMapping[championId] || 'Unknown';
} 