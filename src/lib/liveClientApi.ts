// src/lib/liveClientApi.ts

const LIVE_CLIENT_URL = 'https://127.0.0.1:2999/liveclientdata';

export interface LiveGameItem {
  canUse: boolean;
  consumable: boolean;
  count: number;
  displayName: string;
  itemID: number;
  price: number;
  rawDescription: string;
  rawDisplayName: string;
  slot: number;
}

export interface LiveGamePlayer {
  championName: string;
  isBot: boolean;
  isDead: boolean;
  items: LiveGameItem[];
  level: number;
  position: string;
  rawChampionName: string;
  respawnTimer: number;
  scores: {
    assists: number;
    creepScore: number;
    deaths: number;
    kills: number;
    wardScore: number;
  };
  skinID: number;
  summonerName: string;
  riotId: string;
  team: "ORDER" | "CHAOS";
}

export const getLiveGameData = async () => {
  try {
    const response = await fetch(`${LIVE_CLIENT_URL}/allgamedata`);
    if (!response.ok) {
      throw new Error('Failed to fetch live game data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching live game data:', error);
    return null;
  }
};

export const getLivePlayerItems = async (riotId: string) => {
  try {
    const response = await fetch(`${LIVE_CLIENT_URL}/playeritems?riotId=${encodeURIComponent(riotId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch player items');
    }
    return response.json() as Promise<LiveGameItem[]>;
  } catch (error) {
    console.error('Error fetching player items:', error);
    return null;
  }
};