// src/lib/matchDataUtils.ts
import { MatchData, Participant } from '@/types/game';

interface RawParticipant {
  summonerName: string;
  kills: number;
  deaths: number;
  assists: number;
  item0?: number | null;
  item1?: number | null;
  item2?: number | null;
  item3?: number | null;
  item4?: number | null;
  item5?: number | null;
  championId?: number;
  teamId?: number;
  gold?: number;
}

export const extractRelevantData = (matchData: any) => {
  if (!matchData?.info?.participants) {
    console.error("Participants not found in match data.");
    return [];
  }

  return matchData.info.participants.map((participant: RawParticipant) => {
    // Get all available items, filtering out null/undefined/0 values
    const items = [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5
    ].filter((item): item is number => !!item && item > 0);

    return {
      summonerName: participant.summonerName || "Unknown",
      kills: participant.kills || 0,
      deaths: participant.deaths || 0,
      assists: participant.assists || 0,
      items,
      championId: participant.championId,
      teamId: participant.teamId,
      gold: participant.gold
    };
  });
};