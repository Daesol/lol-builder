'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GameData, Participant } from '@/types/game';

const ItemRecommender = () => {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('NA1');
  const [region, setRegion] = useState('NA1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GameData | null>(null);

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

          {/* Live Game Participant Data */}
          {data?.liveGame && data.liveGame.participants && (
            <div className="mt-6">
              <h3 className="text-blue-400 font-semibold mb-4 text-lg">Live Game Participants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.liveGame.participants.map((participant: Participant) => {
                  // Debugging URLs and Participant Data
                  const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/13.1.1/img/profileicon/${participant.championId}.png`;
                  const items = [
                    participant.item0,
                    participant.item1,
                    participant.item2,
                    participant.item3,
                    participant.item4,
                    participant.item5,
                  ].filter((item) => item);

                  console.log('Participant:', participant);
                  console.log('Profile Icon URL:', profileIconUrl);
                  console.log('Items:', items);

                  return (
                    <div 
                      key={participant.summonerId} 
                      className="flex items-center bg-gray-800 p-4 rounded border border-gray-700"
                    >
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={profileIconUrl}
                          alt={participant.summonerName}
                          className="w-16 h-16 rounded-full"
                          onError={() =>
                            console.error('Failed to load profile icon:', profileIconUrl)
                          }
                        />
                      </div>

                      {/* Participant Info */}
                      <div className="ml-4 flex-1">
                        <h4 className="text-white font-semibold">{participant.summonerName}</h4>
                        <p className="text-gray-400 text-sm">
                          Team: {participant.teamId === 100 ? 'Blue' : 'Red'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Champion ID: {participant.championId}
                        </p>
                        <p className="text-green-400 text-sm font-bold">
                          {participant.kills} / {participant.deaths} / {participant.assists} (K/D/A)
                        </p>
                      </div>

                      {/* Items */}
                      <div className="ml-4 grid grid-cols-3 gap-1">
                        {items.map((item, index) => {
                          const itemImageUrl = `https://ddragon.leagueoflegends.com/cdn/13.1.1/img/item/${item}.png`;
                          console.log('Item Image URL:', itemImageUrl);

                          return (
                            <img
                              key={index}
                              src={itemImageUrl}
                              alt={`Item ${item}`}
                              className="w-8 h-8 rounded"
                              onError={() =>
                                console.error('Failed to load item image:', itemImageUrl)
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
