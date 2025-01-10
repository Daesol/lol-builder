import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { AccountInfo } from './AccountInfo';
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

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
      <CardContent className="p-6">
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

        {data?.account && <AccountInfo account={data.account} summoner={data.summoner} />}

        {data?.liveGame ? (
          <LiveGameDisplay liveGame={data.liveGame} />
        ) : data?.lastMatch ? (
          <LiveGameDisplay lastMatch={data.lastMatch} />
        ) : (
          data?.summoner && (
            <div className="mt-4 bg-gray-800 p-4 rounded border border-gray-700">
              <p className="text-gray-300">{data.summoner.name} is not currently in a game</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;
