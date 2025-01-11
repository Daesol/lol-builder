// src/components/ItemRecommender/LiveGameDisplay.tsx
'use client';

import { LiveGame } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  // Debug logs for raw data
  console.log('Raw Live Game Data:', liveGame);

  const blueTeam = liveGame.participants.filter(p => p.teamId === 100);
  const redTeam = liveGame.participants.filter(p => p.teamId === 200);

  console.log('==== Live Game Data ====');
  console.log('Game Mode:', liveGame.gameMode);
  console.log('Game Type:', liveGame.gameType);
  console.log('Total Participants:', liveGame.participants.length);
  
  // Detailed participant logging
  liveGame.participants.forEach((p, index) => {
    console.log(`Participant ${index + 1}:`, {
      name: p.summonerName,
      champion: p.championId,
      team: p.teamId,
      position: p.teamPosition,
      summonerId: p.summonerId
    });
  });

  console.log('Blue Team:', blueTeam);
  console.log('Red Team:', redTeam);

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-gray-800 p-4 rounded">
        <h3 className="text-blue-400 font-semibold text-lg mb-2">
          Live Game - {liveGame.gameMode} ({liveGame.gameType})
        </h3>
        <div className="text-sm text-gray-400">
          Game Duration: {Math.floor(liveGame.gameLength / 60)}:{(liveGame.gameLength % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div className="space-y-4">
          <h4 className="text-blue-400 font-medium flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            Blue Team
          </h4>
          <div className="space-y-2">
            {blueTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId || participant.championId} 
                participant={participant}
                region={region}
              />
            ))}
          </div>
        </div>

        {/* Red Team */}
        <div className="space-y-4">
          <h4 className="text-red-400 font-medium flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            Red Team
          </h4>
          <div className="space-y-2">
            {redTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId || participant.championId} 
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