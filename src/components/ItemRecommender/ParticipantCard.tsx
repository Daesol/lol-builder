// src/components/ItemRecommender/ParticipantCard.tsx
'use client';

import { useState } from 'react';
import { LiveGameParticipant } from '@/types/game';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);

  const displayName = participant.riotId || participant.summonerName || `Champion ${participant.championId}`;

  console.log('Rendering ParticipantCard:', {
    riotId: participant.riotId,
    championId: participant.championId,
    teamId: participant.teamId,
    allFields: Object.keys(participant)
  });

  const fetchPerformanceData = async () => {
    if (!isExpanded || performanceData) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching performance data for:', {
        summonerId: participant.summonerId,
        championId: participant.championId,
        region: region
      });

      const response = await fetch(
        `/api/champion-performance?` + new URLSearchParams({
          puuid: participant.summonerId,
          championId: participant.championId.toString(),
          region: region
        })
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch performance data');
      }

      console.log('Performance data received:', data);
      setPerformanceData(data);
    } catch (err) {
      console.error('Error fetching performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState && !performanceData && !isLoading) {
      fetchPerformanceData();
    }
  };

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
              <h4 className="text-white font-semibold">{displayName}</h4>
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
          onClick={handleExpand}
          className="ml-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="pl-4">
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2 text-sm">Loading performance data...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {performanceData && (
            <div className="bg-gray-800 rounded p-4">
              <h5 className="text-white text-sm mb-3">Recent Performance</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-gray-400 text-xs">Games</div>
                  <div className="text-white">{performanceData.matchCount}</div>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-gray-400 text-xs">Win Rate</div>
                  <div className="text-white">
                    {((performanceData.wins / performanceData.matchCount) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-gray-400 text-xs">KDA</div>
                  <div className="text-white">
                    {(performanceData.totalKills / Math.max(performanceData.matchCount, 1)).toFixed(1)}/
                    {(performanceData.totalDeaths / Math.max(performanceData.matchCount, 1)).toFixed(1)}/
                    {(performanceData.totalAssists / Math.max(performanceData.matchCount, 1)).toFixed(1)}
                  </div>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-gray-400 text-xs">Avg Damage</div>
                  <div className="text-white">
                    {Math.round(performanceData.totalDamageDealt / performanceData.matchCount).toLocaleString()}
                  </div>
                </div>
              </div>

              {performanceData.matchCount > 0 && (
                <div className="mt-4">
                  <div className="text-gray-400 text-xs mb-2">Most Common Items</div>
                  <div className="grid grid-cols-6 gap-1">
                    {Object.entries(performanceData.commonItems)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 6)
                      .map(([itemId, data]) => (
                        <div 
                          key={itemId}
                          className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300"
                          title={`Used in ${data.count} games (${((data.winCount / data.count) * 100).toFixed(1)}% win rate)`}
                        >
                          {itemId}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};