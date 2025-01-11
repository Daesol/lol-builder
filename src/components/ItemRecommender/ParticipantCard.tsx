'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveGameParticipant, ChampionPerformance } from '@/types/game';
import { getPlaceholderUrl, formatKDA, calculateWinRate, formatNumber } from './utils';

interface MatchStats {
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  goldEarned: number;
  win: boolean;
}

interface ParticipantCardProps {
  participant: LiveGameParticipant;
  region: string;
  matchStats?: MatchStats;
  initialAnalysis?: ChampionPerformance;
  enableAnalysis?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  region,
  matchStats,
  initialAnalysis,
  enableAnalysis = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState<ChampionPerformance | null>(initialAnalysis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = participant.riotIdGameName || participant.summonerName || `Champion ${participant.championId}`;

  const fetchPerformanceData = useCallback(async () => {
    if (!isExpanded || performanceData || !enableAnalysis) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/champion-performance?${new URLSearchParams({
          puuid: participant.summonerId,
          championId: participant.championId.toString(),
          region: region
        })}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch performance data');
      }

      setPerformanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  }, [isExpanded, performanceData, enableAnalysis, participant, region]);

  return (
    <div className="rounded-lg bg-slate-800 p-3">
      <div className="mb-2 flex items-center space-x-2">
        <img 
          src={getPlaceholderUrl(32)} 
          alt="Champion" 
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-100">{displayName}</span>
            <span className="text-xs text-slate-400">
              (Diamond II) {/* Placeholder rank */}
            </span>
          </div>
        </div>
        <div className="text-right text-sm">
          {performanceData && (
            <>
              <div className="font-medium text-slate-100">
                {performanceData.matchCount} Games
              </div>
              <div className="text-green-500">
                {calculateWinRate(performanceData.wins, performanceData.matchCount)}
              </div>
            </>
          )}
        </div>
        {(enableAnalysis || initialAnalysis) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(!isExpanded);
              fetchPerformanceData();
            }}
            className="ml-2"
          >
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 text-center text-sm">
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">KDA</div>
            <div className="font-medium text-slate-100">
              {matchStats ? 
                formatKDA(matchStats.kills, matchStats.deaths, matchStats.assists) :
                performanceData ? 
                  formatKDA(
                    Math.round(performanceData.totalKills / performanceData.matchCount),
                    Math.round(performanceData.totalDeaths / performanceData.matchCount),
                    Math.round(performanceData.totalAssists / performanceData.matchCount)
                  ) : '0/0/0'
              }
            </div>
          </div>
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">DMG</div>
            <div className="font-medium text-slate-100">
              {matchStats ? 
                formatNumber(matchStats.totalDamageDealt) :
                performanceData ?
                  formatNumber(Math.round(performanceData.totalDamageDealt / performanceData.matchCount)) :
                  '0'
              }
            </div>
          </div>
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">Gold</div>
            <div className="font-medium text-slate-100">
              {matchStats ? 
                formatNumber(matchStats.goldEarned) :
                performanceData ?
                  formatNumber(Math.round(performanceData.totalGoldEarned / performanceData.matchCount)) :
                  '0'
              }
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="flex justify-end space-x-1">
          {Array(6).fill(null).map((_, i) => (
            <img
              key={i}
              src={getPlaceholderUrl(24)}
              alt={`Item ${i + 1}`}
              className="rounded-md border border-slate-700"
            />
          ))}
        </div>
      </div>

      {/* Expanded Analysis Section */}
      {isExpanded && (
        <div className="mt-4 border-t border-slate-700 pt-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : performanceData ? (
            <div className="space-y-4">
              {/* Performance Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded bg-slate-900 p-2">
                  <div className="text-xs text-slate-400">Total Games</div>
                  <div className="font-medium text-slate-100">{performanceData.matchCount}</div>
                </div>
                <div className="rounded bg-slate-900 p-2">
                  <div className="text-xs text-slate-400">Win Rate</div>
                  <div className="text-green-500 font-medium">
                    {calculateWinRate(performanceData.wins, performanceData.matchCount)}
                  </div>
                </div>
                <div className="rounded bg-slate-900 p-2">
                  <div className="text-xs text-slate-400">Avg KDA</div>
                  <div className="font-medium text-slate-100">
                    {((performanceData.totalKills + performanceData.totalAssists) / 
                      Math.max(performanceData.totalDeaths, 1)).toFixed(2)}
                  </div>
                </div>
                <div className="rounded bg-slate-900 p-2">
                  <div className="text-xs text-slate-400">Avg Damage</div>
                  <div className="font-medium text-slate-100">
                    {formatNumber(Math.round(performanceData.totalDamageDealt / performanceData.matchCount))}
                  </div>
                </div>
              </div>

              {/* Common Items */}
              {Object.keys(performanceData.commonItems).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-slate-100 mb-2">Most Common Items</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(performanceData.commonItems)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 6)
                      .map(([itemId, data]) => (
                        <div 
                          key={itemId}
                          className="relative rounded bg-slate-900 p-1"
                          title={`Used in ${data.count} games (${calculateWinRate(data.winCount, data.count)} win rate)`}
                        >
                          <img
                            src={getPlaceholderUrl(32)}
                            alt={`Item ${itemId}`}
                            className="rounded"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};