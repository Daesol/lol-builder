// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MatchAnalysisProgress } from '@/components/MatchAnalysisProgress';
import type { MatchAnalysisProgress as ProgressType } from '@/lib/api/riot';
import type { MatchData } from '@/lib/types';

export default function Home() {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  const handleSearch = async (summoner: string, tagLine: string, region: string): Promise<void> => {
    setProgress({
      total: 1,
      current: 0,
      completed: false,
      matchesProcessed: 0,
      matchesSkipped: 0
    });
    setAnalysisComplete(false);
    setMatchData(null);

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
            formData.get('summoner') as string,
            formData.get('tagLine') as string,
            formData.get('region') as string
          );
        }}
        className="space-y-4"
      >
        <div>
          <input
            type="text"
            name="summoner"
            placeholder="Summoner Name"
            className="px-4 py-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="tagLine"
            placeholder="Tag Line (e.g., NA1)"
            className="px-4 py-2 border rounded"
            required
          />
        </div>
        <div>
          <select
            name="region"
            className="px-4 py-2 border rounded"
            defaultValue="NA1"
          >
            <option value="NA1">NA</option>
            <option value="EUW1">EUW</option>
            <option value="KR">KR</option>
            {/* Add other regions as needed */}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>
      
      {progress && (
        <div className="mt-4">
          <MatchAnalysisProgress progress={progress} />
        </div>
      )}
      
      {analysisComplete && matchData && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
          {matchData.liveGame ? (
            <div className="text-green-600">Player is in game!</div>
          ) : matchData.lastMatch ? (
            <div className="text-blue-600">
              Last match found: {matchData.lastMatch.gameId}
            </div>
          ) : (
            <div className="text-gray-600">No recent matches found</div>
          )}
          
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(matchData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}