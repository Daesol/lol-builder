import type { ChampionData, ItemData } from '@/types/game';

export class DataDragonAPI {
  private version: string;
  private baseUrl: string;

  constructor(version = '14.4.1') {  // Update to latest version
    this.version = version;
    this.baseUrl = 'https://ddragon.leagueoflegends.com';
  }

  getChampionIconUrl(championName: string): string {
    // Convert champion name to match Data Dragon format (e.g., "Kai'Sa" -> "Kaisa")
    const formattedName = championName
      .replace(/[^a-zA-Z]/g, '')  // Remove special characters
      .toLowerCase();
    return `${this.baseUrl}/cdn/${this.version}/img/champion/${formattedName}.png`;
  }

  getItemIconUrl(itemId: number): string {
    return `${this.baseUrl}/cdn/${this.version}/img/item/${itemId}.png`;
  }
}

export const ddragonApi = new DataDragonAPI();
