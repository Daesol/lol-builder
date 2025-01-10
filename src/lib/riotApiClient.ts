// src/lib/riotApiClient.ts

const fetchFromRiotAPI = async (url: string, endpoint: string) => {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    
    console.log(`Fetching ${endpoint}:`, {
      url,
      hasKey: !!RIOT_API_KEY,
      keyPrefix: RIOT_API_KEY?.substring(0, 8)
    });
  
    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      throw new Error('Invalid API key format');
    }
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
          'Accept': 'application/json'
        }
      });
  
      console.log(`${endpoint} response:`, {
        status: response.status,
        ok: response.ok
      });
  
      // Special handling for 404 in spectator endpoint
      if (response.status === 404 && endpoint === 'Live Game') {
        console.log('Player not in game');
        return null;
      }
  
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error(`Failed to parse ${endpoint} response:`, text);
        throw new Error(`Invalid response from ${endpoint} endpoint`);
      }
  
      if (!response.ok) {
        console.error(`${endpoint} error:`, data);
        throw new Error(data.status?.message || `${endpoint} request failed`);
      }
  
      return data;
    } catch (error) {
      console.error(`${endpoint} request failed:`, error);
      throw error;
    }
  };
  
  export const getAccountData = async (summonerName: string, tagLine: string) => {
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    return fetchFromRiotAPI(url, 'Account');
  };
  
  export const getSummonerData = async (puuid: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return fetchFromRiotAPI(url, 'Summoner');
  };
  
  export const getLiveGameData = async (summonerId: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
    return fetchFromRiotAPI(url, 'Live Game');
  };