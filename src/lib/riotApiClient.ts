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
    // Use platform routing (na1, euw1, etc.)
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
    
    console.log('Getting live game data:', {
      puuid,
      region,
      platformUrl: region.toLowerCase(),
      url
    });
    
    return makeRiotRequest(url);
  };

  export const getMatchIds = async (puuid: string, region: string) => {
    // Convert platform to regional routing
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
                         
    // Get only the most recent match
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('No matches found');
    return data;
  };
  
  export const getMatchDetails = async (matchId: string, region: string) => {
    // Convert platform to regional routing
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
  
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Match not found');
    return data;
  };

  export const getRankData = async (summonerId: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    const data = await makeRiotRequest(url);
    if (!data) return null;
    
    // Find the solo queue rank
    const soloQueue = data.find((queue: any) => queue.queueType === 'RANKED_SOLO_5x5');
    return soloQueue || null;
  };