// src/lib/riotApiClient.ts

const RIOT_API_KEY = process.env.RIOT_API_KEY?.trim();

if (!RIOT_API_KEY) {
  throw new Error('RIOT_API_KEY is not configured. Please add it to your environment variables.');
}

const fetchFromRiotAPI = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY!,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error fetching data from Riot API: ${url}`, {
      status: response.status,
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

export const getMatchIds = async (puuid: string) => {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
  return fetchFromRiotAPI(url);
};

export const getMatchInfo = async (matchId: string) => {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return fetchFromRiotAPI(url);
};
