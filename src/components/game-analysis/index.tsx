'use client';

import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { LiveGameDisplay } from './LiveGame';
import type { ApiResponse } from '@/types/game';
import { Loader2 } from 'lucide-react';

export const GameAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<ApiResponse | null>(null);

  const handleSearch = async (summonerName: string, tagLine: string, region: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/live-game?${new URLSearchParams({
          summoner: summonerName,
          tagLine,
          region
        })}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setGameData(data);

      if (!data.liveGame) {
        setError(`${summonerName} is not currently in a game`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {gameData?.liveGame && (
        <LiveGameDisplay 
          game={gameData.liveGame} 
          region={gameData.region} 
        />
      )}
    </div>
  );
};

export default GameAnalysis;

export { default as LiveGame, LiveGameDisplay } from './LiveGame';
export * from './ChampionAnalysis';