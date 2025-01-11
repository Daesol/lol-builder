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
  
  export const getLiveGameData = async (summonerId: string, region: string) => {
    const url = `https://${region.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${summonerId}`;
    return makeRiotRequest(url);
  };
  
  export const getMatchIds = async (puuid: string, region: string) => {
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
                           
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('No matches found');
    return data;
  };
  
  export const getMatchDetails = async (matchId: string, region: string) => {
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
  
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Match not found');
    return data;
  };
  
  export const getParticipantMatchHistory = async (puuid: string, region: string, count: number = 20) => {
    const regionalRoute = region.toLowerCase().includes('na') ? 'americas' :
                         region.toLowerCase().includes('euw') ? 'europe' :
                         region.toLowerCase().includes('kr') ? 'asia' :
                         'americas';
                           
    const url = `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('No matches found');
    return data;
  };
  
  export const getChampionMastery = async (summonerId: string, region: string, championId?: number) => {
    const url = championId 
      ? `https://${region.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}/by-champion/${championId}`
      : `https://${region.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
    
    const data = await makeRiotRequest(url);
    if (!data) throw new Error('Champion mastery data not found');
    return data;
  };
  
  interface ChampionMatchData {
    matchId: string;
    gameCreation: number;
    gameDuration: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    totalDamageDealt: number;
    goldEarned: number;
    itemBuild: number[];
  }
  
  interface ChampionAnalysis {
    championId: number;
    championName: string;
    games: number;
    wins: number;
    winRate: string;
    avgKDA: string;
    avgDamage: number;
    avgGold: number;
    matches: ChampionMatchData[];
  }
  
  export const analyzeParticipantChampions = async (
    puuid: string, 
    summonerId: string, 
    region: string
  ): Promise<ChampionAnalysis[]> => {
    try {
      // Get recent matches
      const matchIds = await getParticipantMatchHistory(puuid, region, 20);
      
      // Get details for all matches
      const matchDetails = await Promise.all(
        matchIds.map((matchId: string) => getMatchDetails(matchId, region))
      );
  
      // Analyze champion usage and performance
      const championStats: Record<number, {
        championId: number;
        championName: string;
        games: number;
        wins: number;
        kills: number;
        deaths: number;
        assists: number;
        totalDamageDealt: number;
        goldEarned: number;
        matches: ChampionMatchData[];
      }> = {};
  
      // Process each match
      matchDetails.forEach(match => {
        const participant = match.info.participants.find((p: { puuid: string; }) => p.puuid === puuid);
        if (!participant) return;
  
        if (!championStats[participant.championId]) {
          championStats[participant.championId] = {
            championId: participant.championId,
            championName: participant.championName,
            games: 0,
            wins: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            totalDamageDealt: 0,
            goldEarned: 0,
            matches: []
          };
        }
  
        const stats = championStats[participant.championId];
        stats.games++;
        if (participant.win) stats.wins++;
        stats.kills += participant.kills;
        stats.deaths += participant.deaths;
        stats.assists += participant.assists;
        stats.totalDamageDealt += participant.totalDamageDealtToChampions;
        stats.goldEarned += participant.goldEarned;
        stats.matches.push({
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          totalDamageDealt: participant.totalDamageDealtToChampions,
          goldEarned: participant.goldEarned,
          itemBuild: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6
          ]
        });
      });
  
      // Convert to array and sort by games played
      return Object.values(championStats)
        .sort((a, b) => b.games - a.games)
        .map(stats => ({
          ...stats,
          winRate: (stats.wins / stats.games * 100).toFixed(1),
          avgKDA: ((stats.kills + stats.assists) / Math.max(1, stats.deaths)).toFixed(2),
          avgDamage: Math.round(stats.totalDamageDealt / stats.games),
          avgGold: Math.round(stats.goldEarned / stats.games)
        }));
    } catch (error) {
      console.error('Error analyzing participant champions:', error);
      throw error;
    }
  };