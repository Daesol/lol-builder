'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { LastMatchDisplay } from './LastMatchDisplay';
import { ApiResponse } from '@/types/game';

const ItemRecommender: React.FC = () => {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('NA1');
  const [region, setRegion] = useState('NA1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const fetchGameData = async () => {
    if (!summonerName.trim()) {
      setError('Please enter a summoner name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/live-game?summoner=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred');
      }

      setData(result);
    } catch (err) {
      console.error('Error in fetchGameData:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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

          {data && (
            <div className="space-y-4">
              {liveGame ? (
                <>
                  <Alert>
                    <AlertDescription>Player is currently in game!</AlertDescription>
                  </Alert>
                  <LiveGameDisplay liveGame={liveGame} region={region} />
                </>
              ) : data.lastMatch ? (
                <>
                  <Alert>
                    <AlertDescription>Player is not in game. Showing last match data.</AlertDescription>
                  </Alert>
                  <LastMatchDisplay 
                    lastMatch={data.lastMatch}
                    summoner={{
                      name: data.summoner.name,
                      profileIconId: data.summoner.profileIconId
                    }}
                  />
                </>
              ) : (
                <Alert>
                  <AlertDescription>No recent matches found for this player.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;