import { MatchData, Participant } from '@/types/game';

export const extractRelevantData = (matchData: MatchData) => {
  if (!matchData?.info?.participants) {
    console.error('Participants not found in match data.');
    return [];
  }

  return matchData.info.participants.map((participant: Participant) => ({
    summonerName: participant.summonerName || 'Unknown',
    kills: participant.kills || 0,
    deaths: participant.deaths || 0,
    assists: participant.assists || 0,
    items: [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
    ].filter((item) => item), // Remove null/undefined items
  }));
};