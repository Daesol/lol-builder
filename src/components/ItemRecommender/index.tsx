'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { LastMatchDisplay } from './LastMatchDisplay';
import { ApiResponse } from '@/types/game';

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

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      {/* Search Section */}
      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-2xl">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {data.liveGame ? (
              <>
                <Alert className="bg-slate-800 border-slate-700">
                  <AlertDescription>Player is currently in game!</AlertDescription>
                </Alert>
                <LiveGameDisplay liveGame={data.liveGame} region={region} />
              </>
            ) : data.lastMatch ? (
              <>
                <Alert className="bg-slate-800 border-slate-700">
                  <AlertDescription>Player is not in game. Showing last match analysis...</AlertDescription>
                </Alert>
                <LastMatchDisplay
                  lastMatch={data.lastMatch}
                  summoner={{
                    name: data.account.gameName,
                    profileIconId: data.summoner.profileIconId
                  }}
                />
              </>
            ) : (
              <Alert className="bg-slate-800 border-slate-700">
                <AlertDescription>No recent matches found for this player.</AlertDescription>
              </Alert>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ItemRecommender;