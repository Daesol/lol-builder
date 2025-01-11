// src/components/ItemRecommender/ParticipantCard.tsx
import { useState } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { ChampionAnalysis } from './ChampionAnalysis';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, region }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors
          ${participant.teamId === 100
            ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/40'
            : 'bg-red-900/30 border-red-700 hover:bg-red-900/40'
          }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div>
              <h4 className="text-white font-semibold">{participant.summonerName}</h4>
              <p className="text-sm text-gray-300">{participant.teamPosition}</p>
            </div>
          </div>
          <div className="text-sm">
            <p className={participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}>
              {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
            </p>
          </div>
        </div>
      </div>

      {/* Champion Analysis Section */}
      {isExpanded && (
        <div className="pl-4">
          <ChampionAnalysis
            participant={{
              puuid: participant.summonerId, // Note: You might need to adjust this based on your actual data structure
              summonerId: participant.summonerId,
              summonerName: participant.summonerName,
              championId: participant.championId,
              teamId: participant.teamId
            }}
            region={region}
          />
        </div>
      )}
    </div>
  );
};