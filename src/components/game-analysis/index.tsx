'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/common/ui/card';
import { Alert, AlertDescription } from '@/components/common/ui/alert';
import { SearchBar } from './SearchBar';
import { LiveGameDisplay } from './LiveGame';
import type { ApiResponse } from '@/types/game';
import { Loader2 } from 'lucide-react';

export const GameAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const handleSearch = async (summonerName: string, tagLine: string, region: string) => {
    console.log('Starting search:', { summonerName, tagLine, region });
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/api/live-game?${new URLSearchParams({
          summoner: summonerName,
          tagLine,
          region
        })}`
      );
      
      const result = await response.json();
      console.log('Search result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Searching for player...</span>
        </div>
      )}

      {data && !loading && !error && (
        <>
          {data.liveGame ? (
            <>
              <div className="bg-green-50 text-green-700 p-4 rounded">
                Player found in active game!
              </div>
              <LiveGameDisplay game={data.liveGame} region={data.region} />
            </>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded">
              Player {data.summoner.name} (Level {data.summoner.summonerLevel}) is not currently in a game
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameAnalysis;