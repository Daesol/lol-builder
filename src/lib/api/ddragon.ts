import type { ItemData } from '@/types/game';

class DDragonAPI {
  private version: string | null = null;
  private itemCache: Map<number, ItemData> = new Map();
  private championCache: Map<number, any> = new Map();

  private async getVersion(): Promise<string> {
    if (this.version) return this.version;
    
    try {
      const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (!response.ok) throw new Error('Failed to fetch version');
      const versions = await response.json();
      this.version = versions[0];
      return this.version;
    } catch (error) {
      console.error('Error fetching DDragon version:', error);
      return '13.24.1'; // Fallback version
    }
  }

  async getItemData(itemId: number): Promise<ItemData | null> {
    if (this.itemCache.has(itemId)) {
      return this.itemCache.get(itemId) || null;
    }

    const version = await this.getVersion();
    try {
      const response = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`
      );
      if (!response.ok) throw new Error('Failed to fetch item data');
      
      const data = await response.json();
      const itemData = data.data[itemId];
      
      if (itemData) {
        this.itemCache.set(itemId, itemData);
        return itemData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error);
      return null;
    }
  }

  getItemImageUrl(itemId: number): string {
    return `https://ddragon.leagueoflegends.com/cdn/${this.version || '13.24.1'}/img/item/${itemId}.png`;
  }

  async getChampionData(championId: number): Promise<any> {
    if (this.championCache.has(championId)) {
      return this.championCache.get(championId);
    }

    const version = await this.getVersion();
    try {
      const response = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
      );
      if (!response.ok) throw new Error('Failed to fetch champion data');
      
      const data = await response.json();
      const championData = Object.values(data.data).find(
        (champion: any) => champion.key === championId.toString()
      );

      if (championData) {
        this.championCache.set(championId, championData);
        return championData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching champion ${championId}:`, error);
      return null;
    }
  }

  getChampionImageUrl(championId: number): string {
    return `https://ddragon.leagueoflegends.com/cdn/${this.version || '13.24.1'}/img/champion/${championId}.png`;
  }
}

export const ddragonApi = new DDragonAPI();
