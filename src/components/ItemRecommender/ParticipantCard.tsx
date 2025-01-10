import { LiveGameParticipant, MatchParticipant } from '@/types/game';
import { ItemSlots } from './ItemSlots';

type Participant = LiveGameParticipant | MatchParticipant;

interface ParticipantCardProps {
  participant: Participant;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  const items = Array.from({ length: 7 }, (_, i) =>
    participant[`item${i}` as keyof Participant]
  ).filter((item): item is number => typeof item === 'number' && item > 0);

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
      <ItemSlots items={items} />
    </div>
  );
};
