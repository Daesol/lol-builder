'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { LastMatchDisplay } from './LastMatchDisplay';
import { ApiResponse } from '@/types/game';
import { LastMatchAnalysis } from './LastMatchAnalysis';

const ItemRecommender = () => {
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
      console.log('Fetching data for:', { summonerName, tagLine, region });
      const response = await fetch(
        `/api/live-game?summoner=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
      );
      const result = await response.json();
      console.log('API Response:', result);

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

  const renderContent = () => {
    if (!data) return null;

    if (data.liveGame) {
      return (
        <>
          <Alert>
            <AlertDescription>Player is currently in game! Analyzing all players...</AlertDescription>
          </Alert>
          <LiveGameDisplay liveGame={data.liveGame} region={region} />
        </>
      );
    }

    if (data.lastMatch) {
      return (
        <>
          <Alert>
            <AlertDescription>
              Player is not in game. Showing their last match analysis...
            </AlertDescription>
          </Alert>
          <LastMatchDisplay
            lastMatch={data.lastMatch}
            summoner={{
              name: data.account.gameName,
              profileIconId: data.summoner.profileIconId
            }}
          />
          <LastMatchAnalysis lastMatch={data.lastMatch} region={region} />
        </>
      );
    }

    return (
      <Alert>
        <AlertDescription>No recent matches found for this player.</AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full max-w-5xl mx-auto bg-gray-900 border-gray-800">
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

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Fetching game data...</p>
            </div>
          ) : (
            renderContent()
          )}

          {/* Debug Info */}
          {data && (
            <div className="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-300">
              <pre>
                Debug Info:
                {JSON.stringify({
                  hasLiveGame: !!data.liveGame,
                  hasLastMatch: !!data.lastMatch,
                  summonerName: data.account?.gameName,
                  region,
                  matchId: data.lastMatch?.metadata?.matchId
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;