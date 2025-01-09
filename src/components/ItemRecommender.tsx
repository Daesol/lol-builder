'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApiResponse, Participant } from '@/types/game';

interface ItemSlotsProps {
  items?: number[];
}

const ItemSlots: React.FC<ItemSlotsProps> = ({ items = [] }) => {
  const getItemImageUrl = (itemId: number): string =>
    `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`;

  // Always show 6 slots
  const slots = Array(6).fill(null);
  
  // Fill available items into slots
  items.forEach((item, index) => {
    if (index < 6) slots[index] = item;
  });

  return (
    <div className="ml-4 grid grid-cols-3 gap-1">
      {slots.map((itemId, idx) => (
        <div 
          key={idx} 
          className={`relative w-8 h-8 rounded ${!itemId ? 'bg-gray-800 border border-gray-700' : ''}`}
          title={itemId ? `Item ${itemId}` : `Empty Slot ${idx + 1}`}
        >
          {itemId ? (
            <div className="relative w-8 h-8">
              <Image
                src={getItemImageUrl(itemId)}
                alt={`Item ${itemId}`}
                fill
                className="rounded object-cover"
                onError={() => {
                  console.error(`Failed to load item image: ${itemId}`);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              {idx + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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
      const timestamp = Date.now();
      const response = await fetch(
        `/api/live-game?summoner=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&_t=${timestamp}`
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

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Summoner Name"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white"
            />
            <Input
              placeholder="Tag (e.g., NA1)"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              className="w-full sm:w-32 bg-gray-800 border-gray-700 text-white"
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

          {/* Account Info */}
          {data?.account && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <h3 className="font-semibold mb-2 text-blue-400">Account Info</h3>
              <p className="text-gray-300">Game Name: {data.account.gameName}</p>
              <p className="text-gray-300">Tag Line: {data.account.tagLine}</p>
              {data.summoner && (
                <p className="text-gray-300">Level: {data.summoner.summonerLevel}</p>
              )}
            </div>
          )}

          {/* Match Data */}
          {data?.matchInfo && data.matchInfo.length > 0 && (
            <div className="mt-6">
              <h3 className="text-blue-400 font-semibold mb-4 text-lg">Recent Match Participants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.matchInfo.map((participant: Participant, index: number) => (
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
                    <ItemSlots items={participant.items} />
                  </div>
                ))}
              </div>

              {/* Build Guide */}
              <div className="mt-6 bg-gray-800 p-4 rounded border border-gray-700">
                <h4 className="text-blue-400 font-semibold mb-2">Item Build Guide</h4>
                <p className="text-gray-300 text-sm">
                  Empty slots indicate available item positions. Typical build order:
                </p>
                <ol className="list-decimal list-inside text-gray-300 text-sm mt-2">
                  <li>Starting items (Slot 1)</li>
                  <li>Core items (Slots 2-3)</li>
                  <li>Boots (Usually slot 4)</li>
                  <li>Situational items (Slots 5-6)</li>
                </ol>
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