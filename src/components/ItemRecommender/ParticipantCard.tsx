// src/components/ItemRecommender/ParticipantCard.tsx
import { LiveGameParticipant } from '@/types/game';
import { LiveGameItems } from './LiveGameItems';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  return (
    <div
      className={`flex flex-col p-4 rounded border gap-2 ${
        participant.teamId === 100
          ? 'bg-blue-900/30 border-blue-700'
          : 'bg-red-900/30 border-red-700'
      }`}
    >
      <h4 className="text-white font-semibold">{participant.summonerName}</h4>
      <p className="text-gray-400 text-sm">Champion ID: {participant.championId}</p>
      <p className={`text-sm ${participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}`}>
        {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
      </p>
      
      {/* Live Items */}
      <div className="mt-2">
        <p className="text-gray-400 text-xs mb-1">Current Items:</p>
        <LiveGameItems 
          riotId={`${participant.summonerName}#${participant.summonerId}`}
          autoUpdate={true}
        />
      </div>
    </div>
  );
};