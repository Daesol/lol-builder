import React from 'react';
import { MatchInfo } from './types';
import { ParticipantCard } from './ParticipantCard';

interface LastMatchDisplayProps {
  lastMatch: MatchInfo;
}

export const LastMatchDisplay: React.FC<LastMatchDisplayProps> = ({ lastMatch }) => (
  <div className="mt-6">
    <h3 className="text-blue-400 font-semibold mb-4 text-lg">
      Last Match - Game ID: {lastMatch.gameId}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {lastMatch.participants.map((participant) => (
        <ParticipantCard key={participant.summonerName} participant={participant} />
      ))}
    </div>
  </div>
);
