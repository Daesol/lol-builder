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
        next: { 
          revalidate: 30 // Cache for 30 seconds
        }
      });
  
      console.log('Request to:', url);
      console.log('Response status:', response.status);
  
      // If 404 for spectator endpoint, return null (player not in game)
      if (response.status === 404 && url.includes('/spectator/')) {
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
  
  export const getLiveGameData = async (puuid: string, region: string) => {
    // Convert region to the correct routing value
    const routingRegion = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas'; // default to americas
  
    const url = `https://${routingRegion}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    return fetchFromRiotAPI(url);
  };