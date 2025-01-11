// src/components/ItemRecommender/LiveGameDisplay.tsx
'use client';

import { LiveGame, LiveGameParticipant } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  // Debug logs
  console.log('=== FULL LIVE GAME DATA ===');
  console.log(JSON.stringify(liveGame, null, 2));

  console.log('Full Live Game Data:', {
    gameMode: liveGame.gameMode,
    participants: liveGame.participants.map(p => ({
      summonerName: p.summonerName,
      summonerId: p.summonerId,
      championId: p.championId,
      teamId: p.teamId,
      riotIdGameName: p.riotIdGameName,
      allKeys: Object.keys(p)
    }))
  });
  
  // Log each participant in detail
  console.log('=== PARTICIPANTS DETAILS ===');
  liveGame.participants.forEach((p: LiveGameParticipant, index) => {
    console.log(`Participant ${index + 1}:`, {
      summonerName: p.summonerName,
      riotIdGameName: p.riotIdGameName,
      summonerId: p.summonerId,
      championId: p.championId,
      teamId: p.teamId,
      teamPosition: p.teamPosition,
      allKeys: Object.keys(p)
    });
  });

  const blueTeam = liveGame.participants.filter(p => p.teamId === 100);
  const redTeam = liveGame.participants.filter(p => p.teamId === 200);

  console.log('Blue Team Size:', blueTeam.length);
  console.log('Red Team Size:', redTeam.length);

  return (
    <div className="mt-6">
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="text-blue-400 font-semibold text-lg">
          Live Game - {liveGame.gameMode} ({liveGame.gameType})
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {blueTeam.length} vs {redTeam.length} Players
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div>
          <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Blue Team
          </h4>
          <div className="space-y-2">
            {blueTeam.map((participant) => {
              console.log('Rendering Blue Team Participant:', {
                name: participant.summonerName,
                riotId: participant.riotIdGameName,
                champion: participant.championId
              });
              return (
                <ParticipantCard 
                  key={participant.summonerId} 
                  participant={participant}
                  region={region}
                />
              );
            })}
          </div>
        </div>

        {/* Red Team */}
        <div>
          <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Red Team
          </h4>
          <div className="space-y-2">
            {redTeam.map((participant) => {
              console.log('Rendering Red Team Participant:', {
                name: participant.summonerName,
                riotId: participant.riotIdGameName,
                champion: participant.championId
              });
              return (
                <ParticipantCard 
                  key={participant.summonerId} 
                  participant={participant}
                  region={region}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};