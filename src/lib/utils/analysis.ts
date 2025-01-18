import { riotApi } from '@/lib/api/riot';
import type { ChampionPerformance, LiveGame, LiveGameAnalysis, Match } from '@/types/game';
import { rateLimit } from '@/lib/utils/cache';

export async function analyzeChampionPerformance(
  matches: Match[],
  puuid: string,
  championId: number
): Promise<ChampionPerformance> {
  console.log('Starting champion performance analysis:', {
    matchCount: matches.length,
    puuid,
    championId
  });

  const performance: ChampionPerformance = {
    matchCount: 0,
    wins: 0,
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalDamageDealt: 0,
    commonItems: {},
    commonRunes: {
      primaryTree: 0,
      secondaryTree: 0,
      keystone: 0
    }
  };

  const itemCounts: Record<string, number> = {};

  matches.forEach(match => {
    const participant = match.info.participants.find(p => p.puuid === puuid);
    
    // Add detailed logging for debugging
    console.log('Analyzing match:', {
      matchId: match.metadata.matchId,
      foundParticipant: !!participant,
      participantChampionId: participant?.championId,
      targetChampionId: championId,
      isMatchingChampion: participant?.championId === championId
    });

    if (!participant || participant.championId !== championId) {
      console.log('Skipping match - wrong champion or participant not found:', {
        matchId: match.metadata.matchId,
        reason: !participant ? 'Participant not found' : 'Different champion',
        expectedChampionId: championId,
        actualChampionId: participant?.championId
      });
      return;
    }

    performance.matchCount++;
    if (participant.win) performance.wins++;
    performance.totalKills += participant.kills;
    performance.totalDeaths += participant.deaths;
    performance.totalAssists += participant.assists;
    performance.totalDamageDealt += participant.totalDamageDealtToChampions;

    // Track completed items
    [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5
    ].forEach(itemId => {
      if (itemId && itemId > 0) {
        itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
      }
    });

    console.log('Processed match:', {
      matchId: match.metadata.matchId,
      championId: participant.championId,
      stats: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        damage: participant.totalDamageDealtToChampions,
        win: participant.win,
        items: [participant.item0, participant.item1, participant.item2, 
                participant.item3, participant.item4, participant.item5]
      }
    });
  });

  performance.commonItems = itemCounts;

  console.log('Analysis complete:', {
    ...performance,
    matchesAnalyzed: matches.length,
    validMatchesFound: performance.matchCount
  });
  
  return performance;
}

export const analyzeLiveGame = async (
  game: LiveGame,
  region: string
): Promise<LiveGameAnalysis> => {
  console.log('Starting live game analysis for', game.participants.length, 'participants');
  const participantAnalyses = [];
  
  for (const participant of game.participants) {
    await rateLimit.waitForAvailability();
    try {
      // Get match history first - now 5 matches
      const matchIds = await riotApi.getMatchHistory(participant.puuid, region, 5);
      console.log(`Fetched ${matchIds.length} matches for ${participant.summonerName}`);
      
      const matches = await Promise.all(
        matchIds.map(id => riotApi.getMatch(id, region))
      );
      
      // Filter out null matches
      const validMatches = matches.filter((match): match is Match => match !== null);
      console.log(`${validMatches.length} valid matches for analysis`);

      const analysis = await analyzeChampionPerformance(
        validMatches,
        participant.puuid,
        participant.championId
      );

      participantAnalyses.push({
        puuid: participant.puuid,
        summonerName: participant.summonerName,
        teamId: participant.teamId,
        analysis
      });
    } catch (error) {
      console.error(`Error analyzing participant ${participant.summonerName}:`, error);
    }
  }

  return {
    blueTeam: participantAnalyses.filter(p => p.teamId === 100),
    redTeam: participantAnalyses.filter(p => p.teamId === 200)
  };
};