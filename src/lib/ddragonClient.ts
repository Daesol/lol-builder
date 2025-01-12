// src/lib/ddragonClient.ts
import type { ItemData, DDragonItemResponse } from '@/types/ddragon';

// Cache the version and item data
let cachedVersion: string | null = null;
let cachedItemData: Record<string, ItemData> | null = null;

export const getCurrentVersion = async (): Promise<string> => {
  if (cachedVersion) return cachedVersion;

  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!response.ok) throw new Error('Failed to fetch version');
    const versions = await response.json();
    cachedVersion = versions[0];
    return versions[0];
  } catch (error) {
    console.error('Error fetching DDragon version:', error);
    return '13.24.1'; // Fallback version
  }
};

export const getItemData = async (): Promise<Record<string, ItemData>> => {
  if (cachedItemData) return cachedItemData;

  const version = await getCurrentVersion();
  try {
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
    if (!response.ok) throw new Error('Failed to fetch item data');
    const data: DDragonItemResponse = await response.json();
    cachedItemData = data.data;
    return data.data;
  } catch (error) {
    console.error('Error fetching item data:', error);
    throw error;
  }
};

export const getItemImageUrl = async (itemId: number): Promise<string> => {
  const version = await getCurrentVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
};

export const getItemInfo = async (itemId: number): Promise<ItemData | undefined> => {
  try {
    const items = await getItemData();
    return items[itemId.toString()];
  } catch (error) {
    console.error(`Error fetching item info for ${itemId}:`, error);
    return undefined;
  }
};