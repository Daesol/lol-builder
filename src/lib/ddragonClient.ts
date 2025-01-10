// src/lib/ddragonClient.ts
import type { ItemData, DDragonItemResponse } from '@/types/ddragon';

// Cache the version and item data
let cachedVersion: string | null = null;
let cachedItemData: Record<string, ItemData> | null = null;

export const getCurrentVersion = async (): Promise<string> => {
  if (cachedVersion) return cachedVersion;

  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  cachedVersion = versions[0];
  return versions[0];
};

export const getItemData = async (): Promise<Record<string, ItemData>> => {
  if (cachedItemData) return cachedItemData;

  const version = await getCurrentVersion();
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
  const data: DDragonItemResponse = await response.json();
  cachedItemData = data.data;
  return data.data;
};

export const getItemImageUrl = async (itemId: number): Promise<string> => {
  const version = await getCurrentVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
};

export const getItemInfo = async (itemId: number): Promise<ItemData | undefined> => {
  const items = await getItemData();
  return items[itemId.toString()];
};