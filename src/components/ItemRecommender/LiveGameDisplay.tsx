// src/components/ItemRecommender/LiveGameDisplay.tsx
import { LiveGame } from '@/types/game';
import { ParticipantCard } from './LiveGame/ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame }) => {
  return (
    <div className="mt-6">
      <h3 className="text-blue-400 font-semibold mb-4 text-lg">
        Live Game - {liveGame.gameMode} ({liveGame.gameType})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {liveGame.participants.map((participant) => (
          <ParticipantCard key={participant.summonerId} participant={participant} />
        ))}
      </div>
    </div>
  );
};