// src/components/ItemRecommender.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApiResponse, MatchParticipant } from '@/types/game';

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
        console.error('API Error:', result);
        throw new Error(result.error || 'An error occurred');
      }

      console.log('API Response:', result);
      setData(result);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getItemImageUrl = (itemId: number): string =>
    `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Summoner Name"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700"
            />
            <Input
              placeholder="Tag (e.g., NA1)"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="w-full sm:w-32 bg-gray-800 border-gray-700"
            />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="NA1">NA</option>
              <option value="EUW1">EUW</option>
              <option value="KR">KR</option>
              <option value="BR1">BR</option>
            </select>
            <Button 
              onClick={fetchGameData}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Match Data */}
          {data?.matchInfo && data.matchInfo.length > 0 && (
            <div className="mt-6">
              <h3 className="text-blue-400 font-semibold mb-4 text-lg">Match Participants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.matchInfo.map((participant: MatchParticipant, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center bg-gray-800 p-4 rounded border border-gray-700"
                  >
                    {/* Participant Info */}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{participant.summonerName}</h4>
                      <p className="text-gray-400 text-sm">
                        K/D/A: {participant.kills} / {participant.deaths} / {participant.assists}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="ml-4 grid grid-cols-3 gap-1">
                      {participant.items.map((itemId, idx) => (
                        <div key={idx} className="relative w-8 h-8">
                          {itemId ? (
                            <Image
                              src={getItemImageUrl(itemId)}
                              alt={`Item ${itemId}`}
                              width={32}
                              height={32}
                              className="rounded"
                              onError={() => {
                                console.error(`Failed to load item image: ${itemId}`);
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-700 rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Info */}
          {data && (
            <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="font-semibold mb-2 text-yellow-400">Debug Info</h3>
              <pre className="text-xs text-gray-400 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;