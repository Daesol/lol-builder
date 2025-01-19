'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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