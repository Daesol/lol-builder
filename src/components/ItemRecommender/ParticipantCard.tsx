// src/components/ItemRecommender/ParticipantCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { ChampionPerformance } from './ChampionPerformance';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, region }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('Rendering ParticipantCard for:', participant.summonerName, {
    championId: participant.championId,
    teamId: participant.teamId,
    position: participant.teamPosition
  });

  const fetchPerformanceData = async () => {
    if (!isExpanded || performanceData) return;

    setIsLoading(true);
    try {
      console.log('Fetching performance data for:', participant.summonerName);
      const response = await fetch(
        `/api/champion-performance?puuid=${participant.summonerId}&region=${region}&championId=${participant.championId}`
      );
      const data = await response.json();
      console.log('Performance data received:', data);
      setPerformanceData(data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [isExpanded]);

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
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300">
              {participant.championId}
            </div>
            <div>
              <h4 className="text-white font-semibold">{participant.summonerName}</h4>
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
          onClick={() => {
            setIsExpanded(!isExpanded);
            console.log('Toggling analysis for:', participant.summonerName);
          }}
          className="ml-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="pl-4">
          {isLoading ? (
            <div className="text-gray-400 text-sm">Loading performance data...</div>
          ) : performanceData ? (
            <div className="bg-gray-800 rounded p-4">
              <h5 className="text-white text-sm mb-2">Recent Performance</h5>
              <pre className="text-xs text-gray-300 overflow-auto">
                {JSON.stringify(performanceData, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No performance data available</div>
          )}
        </div>
      )}
    </div>
  );
};