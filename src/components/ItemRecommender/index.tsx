// src/components/ItemRecommender/index.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApiResponse, LiveGameParticipant } from '@/types/game';
import Image from 'next/image';

interface ItemSlotsProps {
  items?: number[];
}

const ItemSlots: React.FC<ItemSlotsProps> = ({ items = [] }) => {
  // Always show 6 slots
  const slots = Array(6).fill(null);
  items.forEach((item, index) => {
    if (index < 6) slots[index] = item;
  });

  return (
    <div className="grid grid-cols-3 gap-1">
      {slots.map((itemId, idx) => (
        <div
          key={idx}
          className={`relative w-8 h-8 rounded ${!itemId ? 'bg-gray-800 border border-gray-700' : ''}`}
          title={itemId ? `Item ${itemId}` : `Empty Slot ${idx + 1}`}
        >
          {itemId ? (
            <div className="relative w-8 h-8">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`}
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

          {/* Live Game Data */}
          {data?.liveGame?.participants && data.liveGame.participants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-blue-400 font-semibold mb-4 text-lg">
                Live Game - {data.liveGame.gameMode} ({data.liveGame.gameType})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.liveGame.participants.map((participant: LiveGameParticipant) => (
                  <div
                    key={participant.summonerId}
                    className={`flex items-center p-4 rounded border ${
                      participant.teamId === 100
                        ? 'bg-blue-900/30 border-blue-700'
                        : 'bg-red-900/30 border-red-700'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{participant.summonerName}</h4>
                      <p className="text-gray-400 text-sm">Champion ID: {participant.championId}</p>
                      <p className={`text-sm ${participant.teamId === 100 ? 'text-blue-400' : 'text-red-400'}`}>
                        {participant.teamId === 100 ? 'Blue Team' : 'Red Team'}
                      </p>
                    </div>
                    <ItemSlots 
                      items={[
                        participant.item0,
                        participant.item1,
                        participant.item2,
                        participant.item3,
                        participant.item4,
                        participant.item5,
                        participant.item6,
                      ].filter((item): item is number => typeof item === 'number' && item > 0)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not In Game Message */}
          {data?.summoner && !data.liveGame && (
            <div className="mt-4 bg-gray-800 p-4 rounded border border-gray-700">
              <p className="text-gray-300">
                {data.summoner.name} is not currently in a game
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemRecommender;