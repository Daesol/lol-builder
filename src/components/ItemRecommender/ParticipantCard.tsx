import React from 'react';
import { ParticipantBase } from './types';
import { ItemSlots } from './ItemSlots';

interface ParticipantCardProps {
  participant: ParticipantBase;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  const { summonerName, championId, kills, deaths, assists, items, teamId } = participant;

  return (
    <div
      className={`flex items-center p-4 rounded border ${
        teamId === 100
          ? 'bg-blue-900/30 border-blue-700'
          : 'bg-red-900/30 border-red-700'
      }`}
    >
      <div className="flex-1">
        <h4 className="text-white font-semibold">{summonerName}</h4>
        <p className="text-gray-400 text-sm">Champion ID: {championId}</p>
        {kills !== undefined && deaths !== undefined && assists !== undefined && (
          <p className="text-gray-400 text-sm">
            K/D/A: {kills}/{deaths}/{assists}
          </p>
        )}
      </div>
      <ItemSlots items={items} />
    </div>
  );
};
