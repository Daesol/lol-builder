import type { ItemData, ChampionsData, ChampionData } from '@/types/game';

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

  getChampionIconUrl(championName: string): string {
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

  async getRunes(): Promise<Record<number, RuneData>> {
    const response = await fetch(`${this.getBaseUrl()}/data/en_US/runesReforged.json`);
    const runesData = await response.json();
    
    // Create a flat map of all runes
    const runesMap: Record<number, RuneData> = {};
    
    runesData.forEach((tree: any) => {
      // Add the tree itself
      runesMap[tree.id] = {
        id: tree.id,
        name: tree.name,
        icon: tree.icon,
        key: tree.key
      };
      
      // Add keystones and other runes
      tree.slots.forEach((slot: any) => {
        slot.runes.forEach((rune: any) => {
          runesMap[rune.id] = {
            id: rune.id,
            name: rune.name,
            icon: rune.icon,
            key: rune.key
          };
        });
      });
    });
    
    return runesMap;
  }

  getRuneIconUrl(runeId: number): string {
    return `${this.baseUrl}/cdn/img/${runeId}.png`;
  }

  getRuneTreeIconUrl(treeId: number): string {
    return `${this.baseUrl}/cdn/img/perk-images/Styles/${treeId}.png`;
  }

  async getChampions(): Promise<Record<string, ChampionData>> {
    const response = await fetch(`${this.getBaseUrl()}/data/en_US/champion.json`);
    const data: ChampionsData = await response.json();
    return data.data;
  }
}

// Create and initialize the API
export const ddragonApi = new DataDragonAPI();
ddragonApi.init().catch(console.error);

// Add this type
interface RuneData {
  id: number;
  name: string;
  icon: string;
  key: string;
}
