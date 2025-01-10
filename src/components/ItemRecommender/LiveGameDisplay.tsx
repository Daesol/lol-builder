import React from 'react';
import { LiveGame } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame: LiveGame;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame }) => {
  const transformParticipant = (participant: any) => {
    const items = [];
    for (let i = 0; i <= 6; i++) {
      const itemId = participant[`item${i}`];
      if (itemId && typeof itemId === 'number') {
        items.push(itemId);
      }
    }
    return {
      summonerName: participant.summonerName,
      championId: participant.championId,
      kills: participant.kills || 0,
      deaths: participant.deaths || 0,
      assists: participant.assists || 0,
      items,
      teamId: participant.teamId,
    };
  };

  return (
    <div className="mt-6">
      <h3 className="text-blue-400 font-semibold mb-4 text-lg">
        Live Game - {liveGame.gameMode} ({liveGame.gameType})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {liveGame.participants.map((participant) => (
          <ParticipantCard
            key={participant.summonerId}
            participant={transformParticipant(participant)}
          />
        ))}
      </div>
    </div>
  );
};
