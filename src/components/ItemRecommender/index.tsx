// Update logic to handle lastMatch
import React, { useState } from 'react';
import { SearchSection } from './SearchSection';
import { LiveGameDisplay } from './LiveGameDisplay';
import { LastMatchDisplay } from './LastMatchDisplay'; // New component for match display
import { ApiResponse } from '@/types/types';

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
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      {error && <p className="text-red-500">{error}</p>}
      {data?.liveGame ? (
        <LiveGameDisplay liveGame={data.liveGame} />
      ) : data?.lastMatch ? (
        <LastMatchDisplay lastMatch={data.lastMatch} />
      ) : (
        <p>No game or match data available.</p>
      )}
    </div>
  );
};

export default ItemRecommender;
