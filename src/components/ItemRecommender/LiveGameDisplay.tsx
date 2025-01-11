// src/components/ItemRecommender/LiveGameDisplay.tsx
'use client';

import { LiveGame } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  // Log the live game data for debugging
  console.log('Live Game Data:', liveGame);
  console.log('Number of participants:', liveGame.participants.length);

  // Separate teams
  const blueTeam = liveGame.participants.filter(p => p.teamId === 100);
  const redTeam = liveGame.participants.filter(p => p.teamId === 200);

  return (
    <div className="mt-6">
      <h3 className="text-blue-400 font-semibold mb-4 text-lg">
        Live Game - {liveGame.gameMode} ({liveGame.gameType})
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div>
          <h4 className="text-blue-400 font-medium mb-3">Blue Team</h4>
          <div className="space-y-4">
            {blueTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
              />
            ))}
          </div>
        </div>

        {/* Red Team */}
        <div>
          <h4 className="text-red-400 font-medium mb-3">Red Team</h4>
          <div className="space-y-4">
            {redTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};