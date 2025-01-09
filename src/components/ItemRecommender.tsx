// src/components/ItemRecommender.tsx
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
      console.log('Fetching data for:', summonerName, tagLine, region);
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
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="space-y-4">
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data?.account && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700 mt-4">
              <h3 className="font-semibold mb-2 text-blue-400">Account Info</h3>
              <p className="text-gray-300">Game Name: {data.account.gameName}</p>
              <p className="text-gray-300">Tag Line: {data.account.tagLine}</p>
            </div>
          )}

          {data?.summoner && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700 mt-4">
              <h3 className="font-semibold mb-2 text-blue-400">Summoner Info</h3>
              <p className="text-gray-300">Name: {data.summoner.name || data.account?.gameName}</p>
              <p className="text-gray-300">Level: {data.summoner.summonerLevel}</p>
              <p className="text-gray-300">ID: {data.summoner.id}</p>
              <p className="text-gray-300">PUUID: {data.summoner.puuid}</p>
            </div>
          )}

          {data?.message && (
            <Alert className="mt-4">
              <AlertDescription>{data.message}</AlertDescription>
            </Alert>
          )}

          {data?.liveGame && data.liveGame.participants && data.liveGame.participants.length > 0 && (
            <div className="bg-gray-800 p-4 rounded border border-gray-700 mt-4">
              <h3 className="font-semibold mb-2 text-blue-400">Live Game Info</h3>
              <p className="text-gray-300">Game Type: {data.liveGame.gameType}</p>
              <p className="text-gray-300">Game Mode: {data.liveGame.gameMode}</p>
              <p className="text-gray-300">Game ID: {data.liveGame.gameId}</p>
              <div className="mt-4">
                <h4 className="font-medium text-blue-400 mb-2">Players:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.liveGame.participants.map((participant: Participant) => (
                    <div 
                      key={participant.summonerId || Math.random()}
                      className="p-2 bg-gray-700 rounded border border-gray-600 text-gray-200"
                    >
                      <p>{participant.summonerName}</p>
                      <p className="text-sm text-gray-400">Champion ID: {participant.championId}</p>
                      <p className="text-sm text-gray-400">Team: {participant.teamId === 100 ? 'Blue' : 'Red'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Debug Information - remove in production */}
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