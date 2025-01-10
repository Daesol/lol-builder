// src/types/ddragon.ts

export interface ItemStats {
    FlatMovementSpeedMod?: number;
    FlatHPPoolMod?: number;
    FlatMPPoolMod?: number;
    FlatArmorMod?: number;
    FlatPhysicalDamageMod?: number;
    FlatMagicDamageMod?: number;
    // Add other stats as needed
  }
  
  export interface ItemGold {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  }
  
  export interface ItemData {
    name: string;
    description: string;
    colloq: string;
    plaintext: string;
    image: {
      full: string;
      sprite: string;
      group: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
    gold: ItemGold;
    tags: string[];
    maps: Record<string, boolean>;
    stats: ItemStats;
    into?: string[];
    from?: string[];
    depth?: number;
  }
  
  export interface DDragonItemResponse {
    type: string;
    version: string;
    data: Record<string, ItemData>;
  }