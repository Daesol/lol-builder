'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { ApiResponse } from '@/types/game';

const ItemRecommender: React.FC = () => {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('NA1');
  const [region, setRegion] = useState('NA1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const fetchGameData = async () => {
    console.log('Fetching game data...', { summonerName, tagLine, region }); // Debug log

    if (!summonerName.trim()) {
      setError('Please enter a summoner name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/api/live-game?summoner=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`;
      console.log('Fetching URL:', url); // Debug log

      const response = await fetch(url);
      console.log('Response status:', response.status); // Debug log

      const result = await response.json();
      console.log('API Response:', result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred');
      }

      setData(result);
    } catch (err) {
      console.error('Error in fetchGameData:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  console.log('Current state:', { loading, error, data }); // Debug log

  const liveGame = data?.liveGame ? {
    ...data.liveGame,
    gameQueueConfigId: data.liveGame.gameQueueConfigId || 0,
    observers: data.liveGame.observers || { encryptionKey: '' },
    platformId: data.liveGame.platformId || '',
    bannedChampions: data.liveGame.bannedChampions || [],
    gameStartTime: data.liveGame.gameStartTime || 0,
    gameLength: data.liveGame.gameLength || 0,
  } : null;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="space-y-4">
          <SearchSection
            summonerName={summonerName}
            tagLine={tagLine}
            region={region}
            loading={loading}
            onSummonerNameChange={setSummonerName}
            onTagLineChange={setTagLine}
            onRegionChange={setRegion}
            onSearch={fetchGameData}
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {liveGame && <LiveGameDisplay liveGame={liveGame} region={region} />}
          
          {/* Debug display */}
          <div className="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-300">
            <pre>
              Debug State:
              Loading: {loading.toString()}
              Error: {error || 'none'}
              Has Data: {data ? 'yes' : 'no'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;