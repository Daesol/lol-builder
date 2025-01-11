// src/components/ItemRecommender/ParticipantCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PerformanceData {
  championId: number;
  matchCount: number;
  wins: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalDamageDealt: number;
  totalGoldEarned: number;
  matches: Array<{
    matchId: string;
    gameCreation: number;
    gameDuration: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    itemBuild: number[];
    damageDealt: number;
    goldEarned: number;
    role: string;
    lane: string;
  }>;
  commonItems: {
    [key: string]: {
      count: number;
      winCount: number;
    };
  };
}

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, region }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
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
    if (isExpanded) {
      fetchPerformanceData();
    }
  }, [isExpanded, participant.summonerId, region, participant.championId]);

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
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  <span className="text-gray-400">Games Played:</span> {performanceData.matchCount}
                </div>
                <div>
                  <span className="text-gray-400">Win Rate:</span>{' '}
                  {((performanceData.wins / performanceData.matchCount) * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="text-gray-400">KDA:</span>{' '}
                  {performanceData.totalKills}/{performanceData.totalDeaths}/{performanceData.totalAssists}
                </div>
                {performanceData.matches.length > 0 && (
                  <div>
                    <span className="text-gray-400">Common Items:</span>
                    <div className="grid grid-cols-6 gap-1 mt-1">
                      {Object.entries(performanceData.commonItems)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .slice(0, 6)
                        .map(([itemId, data]) => (
                          <div 
                            key={itemId}
                            className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs"
                            title={`Used in ${data.count} games`}
                          >
                            {itemId}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No performance data available</div>
          )}
        </div>
      )}
    </div>
  );
};