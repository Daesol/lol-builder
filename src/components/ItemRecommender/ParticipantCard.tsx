'use client';

import { useState } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { ChampionAnalysis } from './ChampionAnalysis';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, region }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('Participant Data:', participant); // Debug log

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center p-4 rounded-lg border
          ${participant.teamId === 100
            ? 'bg-blue-900/30 border-blue-700'
            : 'bg-red-900/30 border-red-700'
          }`}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div>
              <h4 className="text-white font-semibold">
                {participant.riotIdGameName || participant.summonerName}
                {participant.riotIdTagline && 
                  <span className="text-gray-400 text-sm ml-1">#{participant.riotIdTagline}</span>
                }
              </h4>
              <p className="text-sm text-gray-300">
                {participant.teamPosition || 'Unknown Position'}
              </p>
            </div>
          </div>
          <div className="text-sm">
            <p className={participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}>
              {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="pl-4">
          <ChampionAnalysis
            participant={{
              puuid: participant.summonerId, // Using summonerId as a unique identifier
              summonerId: participant.summonerId,
              summonerName: participant.riotIdGameName || participant.summonerName,
              championId: participant.championId,
              teamId: participant.teamId
            }}
            region={region}
          />
        </div>
      )}
    </div>
  );
};