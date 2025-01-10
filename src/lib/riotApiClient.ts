// src/lib/riotApiClient.ts

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
    console.log('Request URL:', url);
  
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
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Summoner not found');
    return data;
  };
  
  export const getLiveGameData = async (puuid: string, region: string) => {
    // Get the correct regional routing
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
  
    // Use v5 endpoint with PUUID
    const url = `https://${regionalRoute}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    
    console.log('Getting live game data:', {
      puuid,
      region,
      regionalRoute,
      url
    });
    
    return makeRiotRequest(url);
  };