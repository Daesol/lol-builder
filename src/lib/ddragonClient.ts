// src/lib/ddragonClient.ts

// Cache the version and item data
let cachedVersion: string | null = null;
let cachedItemData: Record<string, any> | null = null;

export const getCurrentVersion = async (): Promise<string> => {
  if (cachedVersion) return cachedVersion;

  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  cachedVersion = versions[0]; // Get the latest version
  return versions[0]; // Return the version directly instead of cached value
};

export const getItemData = async (): Promise<Record<string, any>> => {
  if (cachedItemData) return cachedItemData;

  const version = await getCurrentVersion();
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
  const data = await response.json();
  cachedItemData = data.data;
  return data.data;
};

export const getItemImageUrl = async (itemId: number): Promise<string> => {
  const version = await getCurrentVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
};

export const getItemInfo = async (itemId: number) => {
  const items = await getItemData();
  return items[itemId];
};