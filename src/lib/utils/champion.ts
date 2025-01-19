import { ddragonApi } from '@/lib/api/ddragon';
import type { ChampionData } from '@/types/game';

let championMapping: Record<number, string> = {};

export async function initChampionMapping() {
  try {
    const championsData = await ddragonApi.getChampions();
    championMapping = Object.entries(championsData).reduce((acc, [_, champion]) => {
      acc[parseInt(champion.key)] = champion.id;
      return acc;
    }, {} as Record<number, string>);
  } catch (error) {
    console.error('Failed to initialize champion mapping:', error);
  }
}

export function getChampionName(championId: number): string {
  return championMapping[championId] || 'Unknown';
} 