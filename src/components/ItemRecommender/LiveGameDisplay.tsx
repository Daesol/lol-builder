// src/components/ItemRecommender/LiveGameDisplay.tsx
import { LiveGame } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  return (
    <div className="mt-6">
      <h3 className="text-blue-400 font-semibold mb-4 text-lg">
        Live Game - {liveGame.gameMode} ({liveGame.gameType})
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blue Team */}
        <div className="space-y-2">
          <h4 className="text-blue-400 font-medium">Blue Team</h4>
          {liveGame.participants
            .filter(p => p.teamId === 100)
            .map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
              />
            ))}
        </div>
        {/* Red Team */}
        <div className="space-y-2">
          <h4 className="text-red-400 font-medium">Red Team</h4>
          {liveGame.participants
            .filter(p => p.teamId === 200)
            .map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
              />
            ))}
        </div>
      </div>
    </div>
  );
};