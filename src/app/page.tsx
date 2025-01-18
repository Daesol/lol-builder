// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MatchAnalysisProgress } from '@/components/MatchAnalysisProgress';
import type { AnalysisProgressData } from '@/lib/api/riot';
import type { MatchData, PlayerAnalysis } from '@/lib/types';

export default function Home() {
  const [progress, setProgress] = useState<AnalysisProgressData | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [playerAnalysis, setPlayerAnalysis] = useState<PlayerAnalysis | null>(null);

  const handleSearch = async (summonerTag: string, region: string): Promise<void> => {
    const [summoner, tagLine] = summonerTag.split('#');
    if (!summoner || !tagLine) {
      alert('Please enter a valid summoner name with tag (e.g., Player#NA1)');
      return;
    }

    setProgress({
      total: 1,
      current: 0,
      completed: false,
      matchesProcessed: 0,
      matchesSkipped: 0
    });
    setAnalysisComplete(false);
    setMatchData(null);
    setPlayerAnalysis(null);

    try {
      const response = await fetch(
        `/api/live-game?summoner=${encodeURIComponent(summoner)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(region)}`
      );
      const data = await response.json() as MatchData & { error?: string };

      if (data.error) {
        setProgress(prev => ({
          ...prev!,
          completed: true,
          error: data.error
        }));
        return;
      }

      setMatchData(data);
      setProgress(prev => ({
        ...prev!,
        completed: true,
        matchesProcessed: data.lastMatch ? 1 : 0,
        matchesSkipped: data.lastMatch ? 0 : 1
      }));
      setAnalysisComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze matches';
      setProgress(prev => ({
        ...prev!,
        completed: true,
        error: errorMessage
      }));
    }
  };

  return (
    <main className="container mx-auto p-4">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSearch(
            formData.get('summonerTag') as string,
            formData.get('region') as string
          );
        }}
        className="space-y-4"
      >
        <div>
          <input
            type="text"
            name="summonerTag"
            placeholder="Summoner Name#Tag (e.g., Player#NA1)"
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>
        <div>
          <select
            name="region"
            className="w-full px-4 py-2 border rounded"
            defaultValue="NA1"
          >
            <option value="NA1">NA</option>
            <option value="EUW1">EUW</option>
            <option value="KR">KR</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Analyze Game
        </button>
      </form>
      
      {progress && (
        <div className="mt-4">
          <MatchAnalysisProgress progress={progress} />
        </div>
      )}
      
      {analysisComplete && matchData && (
        <div className="mt-8 space-y-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Game Status</h2>
            {matchData.liveGame ? (
              <div className="text-green-600">
                Live Game Analysis
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <h3 className="font-semibold mb-2">Allied Team</h3>
                    {/* Team analysis will go here */}
                  </div>
                  <div className="p-4 bg-red-50 rounded">
                    <h3 className="font-semibold mb-2">Enemy Team</h3>
                    {/* Enemy analysis will go here */}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">Player is not in game</div>
            )}
          </div>

          {playerAnalysis && (
            <div className="p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Performance Analysis</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">KDA Analysis</h3>
                  {/* KDA stats will go here */}
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Item Builds</h3>
                  {/* Item build analysis will go here */}
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Runes</h3>
                  {/* Rune analysis will go here */}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recommendations</h2>
            {/* Build recommendations will go here */}
          </div>
        </div>
      )}
    </main>
  );
}