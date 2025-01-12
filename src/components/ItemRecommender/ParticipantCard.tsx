'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemSlots } from '@/components/ItemRecommender/ItemSlots';
import type { 
  ParticipantCardProps, 
  ChampionPerformance,
  ItemStats
} from './types';

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  region, 
  matchStats,
  enableAnalysis = false,
  initialAnalysis
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState<ChampionPerformance | null>(initialAnalysis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostCommonItems, setMostCommonItems] = useState<number[]>([]);

  const displayName = participant.riotIdGameName || participant.summonerName || `Champion ${participant.championId}`;

  const fetchPerformanceData = useCallback(async () => {
    if (!isExpanded || performanceData || !enableAnalysis) return;
    
    setIsLoading(true);
    setError(null);

    try {
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

      setPerformanceData(data);

      // Process common items and sort them by count
      // Type assertion for the entire entries array
      const entries = Object.entries(data.commonItems) as [string, ItemStats][];
      const sortedItems = entries
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 6)
              .map(([itemId]) => parseInt(itemId));
      
      
      setMostCommonItems(sortedItems);
    } catch (err) {
      console.error('Error fetching performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setIsLoading(false);
    }
  }, [isExpanded, performanceData, enableAnalysis, participant.summonerId, participant.championId, region]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const getItemWinRate = (itemId: number) => {
    if (!performanceData?.commonItems[itemId]) return null;
    const { count, winCount } = performanceData.commonItems[itemId];
    return ((winCount / count) * 100).toFixed(1);
  };

  const getAverageKDA = () => {
    if (!performanceData || performanceData.matchCount === 0) return '0/0/0';
    const avgKills = (performanceData.totalKills / performanceData.matchCount).toFixed(1);
    const avgDeaths = (performanceData.totalDeaths / performanceData.matchCount).toFixed(1);
    const avgAssists = (performanceData.totalAssists / performanceData.matchCount).toFixed(1);
    return `${avgKills}/${avgDeaths}/${avgAssists}`;
  };

  const getAverageDamage = () => {
    if (!performanceData || performanceData.matchCount === 0) return '0';
    return Math.round(performanceData.totalDamageDealt / performanceData.matchCount).toLocaleString();
  };

  const getAverageGold = () => {
    if (!performanceData || performanceData.matchCount === 0) return '0';
    return Math.round(performanceData.totalGoldEarned / performanceData.matchCount).toLocaleString();
  };

  return (
    <div className="rounded-lg bg-slate-800 p-3">
      <div className="mb-2 flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-300">
          {participant.championId}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-100">{displayName}</span>
            {participant.championName && (
              <span className="text-xs text-slate-400">{participant.championName}</span>
            )}
          </div>
        </div>
        {performanceData && (
          <div className="text-right text-sm">
            <div className="font-medium text-slate-100">{performanceData.matchCount} Games</div>
            <div className={performanceData.wins / performanceData.matchCount >= 0.5 ? "text-green-500" : "text-red-500"}>
              {((performanceData.wins / performanceData.matchCount) * 100).toFixed(1)}% WR
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 text-center text-sm">
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">KDA</div>
            <div className="font-medium text-slate-100">
              {performanceData ? getAverageKDA() : '0/0/0'}
            </div>
          </div>
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">DMG</div>
            <div className="font-medium text-slate-100">
              {performanceData ? getAverageDamage() : '0'}
            </div>
          </div>
          <div className="rounded bg-slate-900 p-1">
            <div className="text-xs text-slate-400">Gold</div>
            <div className="font-medium text-slate-100">
              {performanceData ? getAverageGold() : '0'}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="flex justify-end">
          <ItemSlots 
            items={mostCommonItems} 
            tooltipSuffix={(itemId: number) => {
              const winRate = getItemWinRate(itemId);
              return winRate ? ` (${winRate}% win rate)` : '';
            }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};