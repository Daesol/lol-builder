'use client';

// src/components/ItemRecommender.tsx
import React, { useState } from 'react';
import type { GameInfo } from '@/types/components';

interface ItemRecommenderProps {
  initialRegion?: string;
}

const ItemRecommender: React.FC<ItemRecommenderProps> = ({ 
  initialRegion = 'NA1' 
}) => {
  const [summonerName, setSummonerName] = useState<string>('');
  const [region, setRegion] = useState<string>(initialRegion);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const fetchGameData = async () => {
    if (!summonerName.trim()) {
      setError('Please enter a summoner name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/live-game?summoner=${encodeURIComponent(summonerName)}&region=${region}`
      );
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        console.error('API Response Error:', {
          status: response.status,
          data: data
        });
        throw new Error(errorMessage);
      }

      setGameInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="Summoner Name"
              className="flex-1 px-4 py-2 border rounded"
            />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="NA1">NA</option>
              <option value="EUW1">EUW</option>
              <option value="KR">KR</option>
              <option value="EUN1">EUNE</option>
            </select>
            <button
              onClick={fetchGameData}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {gameInfo && (
            <div className="space-y-6">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Current Game</h3>
                {gameInfo.liveGame ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Champion</h4>
                      <p>{gameInfo.liveGame.participants.find(
                        p => p.summonerId === gameInfo.summoner.id
                      )?.championId}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Game Mode</h4>
                      <p>{gameInfo.liveGame.gameMode}</p>
                    </div>
                  </div>
                ) : (
                  <p>Not currently in game</p>
                )}
              </div>

              {gameInfo.recommendations && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Recommended Build</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Core Items</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {gameInfo.recommendations.buildPath.items
                          .filter(item => item.priority === 'core')
                          .map(item => (
                            <div 
                              key={item.id}
                              className="p-2 border rounded"
                            >
                              {item.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemRecommender;