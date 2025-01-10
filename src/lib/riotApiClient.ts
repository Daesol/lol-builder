// src/lib/riotApiClient.ts

// Regional routing mapper
const REGION_TO_REGIONAL_ROUTE: { [key: string]: string } = {
    'NA1': 'AMERICAS',
    'BR1': 'AMERICAS',
    'LA1': 'AMERICAS',
    'LA2': 'AMERICAS',
    'EUW1': 'EUROPE',
    'EUN1': 'EUROPE',
    'TR1': 'EUROPE',
    'RU': 'EUROPE',
    'KR': 'ASIA',
    'JP1': 'ASIA'
  };
  
  const makeRiotRequest = async (url: string) => {
    const apiKey = process.env.RIOT_API_KEY;
    console.log('Making request:', {
      url,
      hasKey: !!apiKey,
      keyPrefix: apiKey?.substring(0, 8)
    });
  
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': apiKey || ''
      }
    });
  
    console.log('Response status:', response.status);
  
    if (response.status === 404) {
      return null;
    }
  
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          data: data,
          url: url
        });
      }
      return data;
    } catch {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response format');
    }
  };
  
  export const getAccountData = async (summonerName: string, tagLine: string) => {
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Account not found');
    return data;
  };
  
  export const getSummonerData = async (puuid: string, region: string) => {
    // Platform routing for Summoner V4
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Summoner not found');
    return data;
  };
  
  export const getLiveGameData = async (puuid: string, region: string) => {
    // Get regional route for Spectator V5
    const regionalRoute = REGION_TO_REGIONAL_ROUTE[region.toUpperCase()] || 'AMERICAS';
    const url = `https://${regionalRoute.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    
    console.log('Getting live game data:', {
      puuid,
      region,
      regionalRoute,
      url
    });
    
    const data = await makeRiotRequest(url);
  
    // If we get data but no items (since Spectator V5 doesn't include items)
    if (data) {
      console.log('Live game found, but no item data available in Spectator V5');
    }
  
    return data;
  };