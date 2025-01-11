// src/components/ItemRecommender/ParticipantCard.tsx
import { useEffect, useState } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { getRankData } from '@/lib/riotApiClient';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
}

interface RankData {
  tier: string;
  rank: string;
  leaguePoints: number;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, region }) => {
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const data = await getRankData(participant.summonerId, region);
        setRankData(data);
      } catch (error) {
        console.error('Error fetching rank:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, [participant.summonerId, region]);

  const getPositionName = (position?: string) => {
    if (!position) return 'Unknown';
    
    const positions: Record<string, string> = {
      'TOP': 'Top',
      'JUNGLE': 'Jungle',
      'MIDDLE': 'Mid',
      'BOTTOM': 'Bot',
      'UTILITY': 'Support'
    };
    return positions[position] || position;
  };

  const getRankDisplay = () => {
    if (loading) return 'Loading...';
    if (!rankData) return 'Unranked';
    return `${rankData.tier} ${rankData.rank} (${rankData.leaguePoints} LP)`;
  };

  return (
    <div
      className={`flex items-center p-4 rounded-lg border ${
        participant.teamId === 100
          ? 'bg-blue-900/30 border-blue-700'
          : 'bg-red-900/30 border-red-700'
      }`}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div>
            <h4 className="text-white font-semibold">{participant.summonerName}</h4>
            <p className="text-sm text-gray-300">{getPositionName(participant.teamPosition)}</p>
          </div>
        </div>
        <div className="text-sm">
          <p className={participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}>
            {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
          </p>
          <p className="text-gray-300">{getRankDisplay()}</p>
        </div>
      </div>
    </div>
  );
};