import type { ItemData } from '@/types/game';

const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
const FALLBACK_VERSION = '15.1.1';

export class DataDragonAPI {
  private version: string;
  private baseUrl: string;
  private cache: {
    items?: Record<number, ItemData>;
  } = {};

  constructor(version?: string) {
    this.version = version || FALLBACK_VERSION;
    this.baseUrl = `${DDRAGON_BASE_URL}/cdn`;
  }

  async init() {
    if (!this.version || this.version === FALLBACK_VERSION) {
      try {
        const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
        const versions = await response.json();
        this.version = versions[0]; // Latest version
      } catch (error) {
        console.warn('Failed to fetch DDragon version, using fallback:', error);
        this.version = FALLBACK_VERSION;
      }
    }
    return this;
  }

  getBaseUrl() {
    return `${this.baseUrl}/${this.version}`;
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

// Create and initialize the API
export const ddragonApi = new DataDragonAPI();
ddragonApi.init().catch(console.error);
