// src/components/ItemRecommender/ParticipantCard.tsx
import { LiveGameParticipant } from '@/types/game';
import { ItemSlots } from './ItemSlots';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  return (
    <div
      className={`flex items-center p-4 rounded border ${
        participant.teamId === 100
          ? 'bg-blue-900/30 border-blue-700'
          : 'bg-red-900/30 border-red-700'
      }`}
    >
      <div className="flex-1">
        <h4 className="text-white font-semibold">{participant.summonerName}</h4>
        <p className="text-gray-400 text-sm">Champion ID: {participant.championId}</p>
        <p className={`text-sm ${participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}`}>
          {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
        </p>
      </div>
      <ItemSlots items={[]} />
    </div>
  );
};