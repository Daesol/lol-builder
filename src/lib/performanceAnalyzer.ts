// src/lib/performanceAnalyzer.ts
import { 
    LiveGame, 
    LiveGameParticipant, 
    Match,
    ChampionPerformance,
    LiveGameAnalysis
  } from '@/types/game';
  import { getParticipantMatchHistory, getMatchDetails } from './riotApiClient';
  
  function createEmptyPerformance(championId: number): ChampionPerformance {
    return {
      championId,
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
  
  function createEmptyParticipantAnalysis(participant: LiveGameParticipant) {
    return {
      summonerId: participant.summonerId,
      summonerName: participant.summonerName,
      championId: participant.championId,
      teamId: participant.teamId,
      championAnalysis: createEmptyPerformance(participant.championId)
    };
  }
  
  function extractChampionMatches(matches: Match[], puuid: string, championId: number) {
    return matches
      .map(match => {
        if (!match?.info?.participants) return null;
  
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (!participant || participant.championId !== championId) return null;
  
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
          ].filter((item): item is number => item !== undefined && item !== 0),
          damageDealt: participant.totalDamageDealtToChampions || 0,
          goldEarned: participant.goldEarned || 0,
          role: participant.role || '',
          lane: participant.lane || ''
        };
      })
      .filter((match): match is NonNullable<typeof match> => match !== null);
  }
  
  function analyzeItemBuilds(matches: ReturnType<typeof extractChampionMatches>) {
    const itemFrequency: { [key: string]: { count: number; winCount: number } } = {};
    
    matches.forEach(match => {
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
  
    return itemFrequency;
  }
  
  export const analyzeChampionPerformance = async (
    puuid: string, 
    region: string, 
    currentChampionId: number
  ): Promise<ChampionPerformance> => {
    try {
      const matchIds = await getParticipantMatchHistory(puuid, region, 20);
      
      if (!matchIds || matchIds.length === 0) {
        return createEmptyPerformance(currentChampionId);
      }
  
      const matchDetails = await Promise.all(
        matchIds.map(matchId => 
          getMatchDetails(matchId, region)
            .catch(error => {
              console.error(`Error fetching match ${matchId}:`, error);
              return null;
            })
        )
      );
  
      const validMatches = matchDetails.filter((match): match is Match => match !== null);
      const championMatches = extractChampionMatches(validMatches, puuid, currentChampionId);
      const itemFrequency = analyzeItemBuilds(championMatches);
  
      return {
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
    } catch (error) {
      console.error('Error in analyzeChampionPerformance:', error);
      throw error;
    }
  };
  
  export const analyzeLiveGame = async (
    liveGame: LiveGame, 
    region: string
  ): Promise<LiveGameAnalysis> => {
    const participantAnalyses = await Promise.all(
      liveGame.participants.map(async participant => {
        try {
          const analysis = await analyzeChampionPerformance(
            participant.puuid,
            region,
            participant.championId
          );
  
          return {
            summonerId: participant.summonerId,
            summonerName: participant.summonerName,
            championId: participant.championId,
            teamId: participant.teamId,
            championAnalysis: analysis
          };
        } catch (error) {
          console.error(`Error analyzing participant ${participant.summonerName}:`, error);
          return createEmptyParticipantAnalysis(participant);
        }
      })
    );
  
    return {
      timestamp: Date.now(),
      gameId: liveGame.gameId,
      gameMode: liveGame.gameMode,
      participants: participantAnalyses
    };
  };