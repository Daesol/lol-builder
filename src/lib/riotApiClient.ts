// src/lib/riotApiClient.ts

const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();

if (!RIOT_API_KEY) {
  throw new Error('RIOT_API_KEY is not configured. Please add it to your environment variables.');
}

const fetchFromRiotAPI = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  });

  // For 404 in live game endpoint, we return null instead of throwing error
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error fetching data from Riot API: ${url}`, {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    throw new Error(`Failed to fetch from Riot API: ${response.status}`);
  }

  return response.json();
};

export const getAccountData = async (summonerName: string, tagLine: string) => {
  const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    summonerName
  )}/${encodeURIComponent(tagLine)}`;
  return fetchFromRiotAPI(url);
};

export const getSummonerData = async (puuid: string, platform: string) => {
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return fetchFromRiotAPI(url);
};

export const getLiveGameData = async (summonerId: string, platform: string) => {
  console.log('Fetching live game data for:', { summonerId, platform });
  const url = `https://${platform.toLowerCase()}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
  console.log('Live game URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    });

    console.log('Live game response status:', response.status);

    if (response.status === 404) {
      console.log('Player not in game');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Live game error:', errorText);
      throw new Error(`Failed to fetch live game data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Live game data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching live game data:', error);
    throw error;
  }
};