import type { ChampionData, ItemData } from '@/types/game';

export class DDragonAPI {
  private version: string = '13.24.1'; // Default version
  private baseUrl: string = 'https://ddragon.leagueoflegends.com';
  private cache: {
    champions?: Record<string, ChampionData>;
    items?: Record<number, ItemData>;
  } = {};

  async getCurrentVersion(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/versions.json`);
      const versions = await response.json();
      this.version = versions[0] || '13.24.1'; // Provide fallback if versions[0] is null
      return this.version;
    } catch (error) {
      console.error('Error fetching DDragon version:', error);
      return '13.24.1'; // Fallback version
    }
  }

  getChampionImageUrl(championId: number): string {
    return `${this.baseUrl}/cdn/${this.version}/img/champion/${championId}.png`;
  }

  getItemImageUrl(itemId: number): string {
    return `${this.baseUrl}/cdn/${this.version}/img/item/${itemId}.png`;
  }

  async getChampionData(championId: number): Promise<ChampionData | null> {
    if (!this.cache.champions) {
      try {
        const response = await fetch(
          `${this.baseUrl}/cdn/${this.version}/data/en_US/champion.json`
        );
        const data = await response.json();
        this.cache.champions = data.data;
      } catch (error) {
        console.error('Error fetching champion data:', error);
        return null;
      }
    }

    return this.cache.champions?.[championId] || null;
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
}

export const ddragonApi = new DDragonAPI();
