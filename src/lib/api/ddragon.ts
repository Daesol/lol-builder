import type { ChampionData, ItemData } from '@/types/game';

export class DataDragonAPI {
  private version: string;
  private baseUrl: string;
  private cache: {
    items?: Record<number, ItemData>;
  } = {};

  constructor(version = '15.1.1') {
    this.version = version;
    this.baseUrl = 'https://ddragon.leagueoflegends.com';
  }

  getChampionIconUrl(championName: string): string {
    if (!championName || championName === 'Unknown') {
      return '/images/unknown-champion.png'; // Fallback image path
    }
    const formattedName = championName
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase();
    return `${this.baseUrl}/cdn/${this.version}/img/champion/${formattedName}.png`;
  }

  getItemIconUrl(itemId: number): string {
    return `${this.baseUrl}/cdn/${this.version}/img/item/${itemId}.png`;
  }

  async getItemData(itemId: number): Promise<ItemData | null> {
    if (!this.cache.items) {
      try {
        const response = await fetch(
          `${this.baseUrl}/cdn/${this.version}/data/en_US/item.json`
        );
        const data = await response.json();
        this.cache.items = data.data;
      } catch (error) {
        console.error('Error fetching item data:', error);
        return null;
      }
    }

    return this.cache.items?.[itemId] || null;
  }

  async getChampions() {
    const response = await fetch(`${this.baseUrl}/data/en_US/champion.json`);
    const data = await response.json();
    return data.data;
  }
}

export const ddragonApi = new DataDragonAPI();
