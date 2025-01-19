import type { ItemData } from '@/types/game';

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

  getBaseUrl() {
    return `${this.baseUrl}/cdn/${this.version}`;
  }

  getChampionIconUrl(championName: string) {
    if (!championName || championName === 'Unknown') {
      return '/images/unknown-champion.png';
    }
    return `${this.getBaseUrl()}/img/champion/${championName}.png`;
  }

  async getItems(): Promise<Record<number, ItemData>> {
    if (this.cache.items) {
      return this.cache.items;
    }

    const response = await fetch(`${this.getBaseUrl()}/data/en_US/item.json`);
    const data = await response.json();
    this.cache.items = data.data as Record<number, ItemData>;
    return this.cache.items;
  }

  getItemIconUrl(itemId: number): string {
    return `${this.getBaseUrl()}/img/item/${itemId}.png`;
  }

  async getItemData(itemId: number): Promise<ItemData | null> {
    const items = await this.getItems();
    return items[itemId] || null;
  }
}

export const ddragonApi = new DataDragonAPI();
