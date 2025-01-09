// src/lib/riotApiClient.ts

interface RiotAPIError {
    status: {
      message: string;
      status_code: number;
    };
  }
  
  const fetchFromRiotAPI = async (url: string, noCache = false) => {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      throw new Error('Invalid or missing Riot API key');
    }
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: noCache ? 'no-store' : 'default',
        next: noCache ? undefined : { revalidate: 30 }
      });
  
      console.log('Request to:', url);
      console.log('Response status:', response.status);
  
      // Handle 404 for spectator endpoint
      if (response.status === 404 && url.includes('/spectator/')) {
        console.log('Player not in game');
        return null;
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        const error = data as RiotAPIError;
        console.error('Riot API Error:', {
          status: response.status,
          message: error.status?.message || 'Unknown error',
          url
        });
        throw new Error(error.status?.message || `HTTP error! status: ${response.status}`);
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching from Riot API:', error);
      throw error;
    }
  };
  
  export const getAccountData = async (summonerName: string, tagLine: string) => {
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    return fetchFromRiotAPI(url);
  };
  
  export const getSummonerData = async (puuid: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return fetchFromRiotAPI(url);
  };
  
  export const getLiveGameData = async (summonerId: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
    console.log('Fetching live game data:', { summonerId, region, url });
    // Pass noCache=true for live game data
    return fetchFromRiotAPI(url, true);
  };