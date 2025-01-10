// src/lib/riotApiClient.ts

interface RiotAPIError {
    status: {
      message: string;
      status_code: number;
    };
  }
  
  const fetchFromRiotAPI = async (url: string) => {
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    if (!RIOT_API_KEY?.startsWith('RGAPI-')) {
      console.error('API key validation failed:', { 
        exists: !!RIOT_API_KEY,
        prefix: RIOT_API_KEY?.substring(0, 8) 
      });
      throw new Error('Invalid or missing Riot API key');
    }
  
    try {
      console.log('Making request to:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        next: { 
          revalidate: 30 
        }
      });
  
      console.log('Response status:', response.status);
  
      if (response.status === 403) {
        const text = await response.text();
        console.error('Forbidden error:', text);
        throw new Error('API key may be invalid or expired');
      }
  
      if (response.status === 404 && url.includes('/spectator/')) {
        console.log('Player not in game');
        return null;
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('API Error response:', data);
        throw new Error(
          data.status?.message || `HTTP error! status: ${response.status}`
        );
      }
  
      return data;
    } catch (error) {
      console.error('Error in fetchFromRiotAPI:', {
        error,
        url,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };
  
  export const getAccountData = async (summonerName: string, tagLine: string) => {
    console.log('Getting account data for:', { summonerName, tagLine });
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    return fetchFromRiotAPI(url);
  };
  
  export const getSummonerData = async (puuid: string, region: string) => {
    console.log('Getting summoner data for:', { puuid, region });
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return fetchFromRiotAPI(url);
  };
  
  export const getLiveGameData = async (summonerId: string, region: string) => {
    console.log('Getting live game data for:', { summonerId, region });
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
    return fetchFromRiotAPI(url);
  };