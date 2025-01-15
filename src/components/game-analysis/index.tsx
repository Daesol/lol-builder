'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/common/ui/card';
import { Alert, AlertDescription } from '@/components/common/ui/alert';
import { SearchBar } from './SearchBar';
import { LiveGameDisplay } from './LiveGame';
import type { ApiResponse } from '@/types/game';

export const GameAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const handleSearch = async (summonerName: string, tagLine: string, region: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Searching for:', { summonerName, tagLine, region });
      const response = await fetch(
        `/api/live-game?${new URLSearchParams({
          summoner: summonerName,
          tagLine,
          region
        })}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error: ${response.status}`);
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data?.liveGame && (
        <>
          <Alert>
            <AlertDescription>
              Player is currently in game! Analyzing match...
            </AlertDescription>
          </Alert>
          <LiveGameDisplay game={data.liveGame} region={data.region} />
        </>
      )}

      {data?.lastMatch && !data.liveGame && (
        <>
          <Alert>
            <AlertDescription>
              Player is not in game. Showing last match analysis...
            </AlertDescription>
          </Alert>
          <Card>
            <CardContent className="p-6">
              <p>Last match details will be displayed here</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default GameAnalysis;