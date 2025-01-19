import { champions } from '@/data/champions';

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