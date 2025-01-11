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

  interface ChampionPerformance {
    championId: number;
    matchCount: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalDamageDealt: number;
    totalGoldEarned: number;
    matches: Array<{
      matchId: string;
      gameCreation: number;
      gameDuration: number;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
      itemBuild: number[];
      damageDealt: number;
      goldEarned: number;
      role: string;
      lane: string;
    }>;
    commonItems: {
      [key: string]: {
        count: number;
        winCount: number;
      };
    };
  }
  
  export const analyzeChampionPerformance = async (
    puuid: string, 
    region: string, 
    currentChampionId: number
  ): Promise<ChampionPerformance> => {
    try {
      // Get last 20 matches
      console.log('Fetching match history:', { puuid, region, currentChampionId });
      const matchIds = await getParticipantMatchHistory(puuid, region, 20);
      console.log('Found match IDs:', matchIds?.length || 0);
  
      if (!matchIds || matchIds.length === 0) {
        console.log('No matches found');
        return {
          championId: currentChampionId,
          matchCount: 0,
          wins: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalDamageDealt: 0,
          totalGoldEarned: 0,
          matches: [],
          commonItems: {}
        };
      }
  
      // Get details for all matches with error handling
      const matchDetailsPromises = matchIds.map((matchId: string) => 
        getMatchDetails(matchId, region)
          .catch(error => {
            console.error(`Error fetching match ${matchId}:`, error);
            return null;
          })
      );
  
      const matchDetails = (await Promise.all(matchDetailsPromises)).filter(match => match !== null);
      console.log('Successfully fetched match details:', matchDetails.length);
  
      // Filter and analyze matches only for the current champion
      const championMatches = matchDetails
        .map(match => {
          if (!match?.info?.participants) {
            console.log('Invalid match data structure:', match);
            return null;
          }
  
          const participant = match.info.participants.find((p: { puuid: string; }) => {
            if (!p || !p.puuid) {
              console.log('Invalid participant data:', p);
              return false;
            }
            return p.puuid === puuid;
          });
  
          if (!participant) {
            console.log(`Player ${puuid} not found in match participants`);
            return null;
          }
  
          if (participant.championId !== currentChampionId) {
            console.log(`Different champion played: ${participant.championId} vs ${currentChampionId}`);
            return null;
          }
  
          console.log('Processing match:', {
            matchId: match.metadata.matchId,
            champion: participant.championId,
            result: participant.win ? 'Win' : 'Loss'
          });
  
          return {
            matchId: match.metadata.matchId,
            gameCreation: match.info.gameCreation,
            gameDuration: match.info.gameDuration,
            win: participant.win,
            kills: participant.kills || 0,
            deaths: participant.deaths || 0,
            assists: participant.assists || 0,
            itemBuild: [
              participant.item0,
              participant.item1,
              participant.item2,
              participant.item3,
              participant.item4,
              participant.item5,
              participant.item6
            ].filter(item => item && item !== 0), // Remove empty item slots
            damageDealt: participant.totalDamageDealtToChampions || 0,
            goldEarned: participant.goldEarned || 0,
            role: participant.role || '',
            lane: participant.lane || ''
          };
        })
        .filter((match): match is NonNullable<typeof match> => match !== null);
  
      console.log('Filtered matches for champion:', {
        total: championMatches.length,
        championId: currentChampionId
      });
  
      // Analyze item builds
      const itemFrequency: { [key: string]: { count: number; winCount: number } } = {};
      championMatches.forEach(match => {
        match.itemBuild.forEach(itemId => {
          if (!itemFrequency[itemId]) {
            itemFrequency[itemId] = { count: 0, winCount: 0 };
          }
          itemFrequency[itemId].count++;
          if (match.win) {
            itemFrequency[itemId].winCount++;
          }
        });
      });
  
      const analysis = {
        championId: currentChampionId,
        matchCount: championMatches.length,
        wins: championMatches.filter(m => m.win).length,
        totalKills: championMatches.reduce((sum, m) => sum + m.kills, 0),
        totalDeaths: championMatches.reduce((sum, m) => sum + m.deaths, 0),
        totalAssists: championMatches.reduce((sum, m) => sum + m.assists, 0),
        totalDamageDealt: championMatches.reduce((sum, m) => sum + m.damageDealt, 0),
        totalGoldEarned: championMatches.reduce((sum, m) => sum + m.goldEarned, 0),
        matches: championMatches,
        commonItems: itemFrequency
      };
  
      console.log('Analysis complete:', {
        championId: currentChampionId,
        matchesAnalyzed: analysis.matchCount,
        winRate: `${((analysis.wins / analysis.matchCount) * 100).toFixed(1)}%`,
        itemsFound: Object.keys(analysis.commonItems).length
      });
  
      return analysis;
    } catch (error) {
      console.error('Error in analyzeChampionPerformance:', error);
      throw error;
    }
  };