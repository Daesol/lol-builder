// src/app/page.tsx
'use client';

import { useState } from 'react';
import { MatchAnalysisProgress } from '@/components/MatchAnalysisProgress';
import type { MatchAnalysisProgress as ProgressType } from '@/lib/api/riot';

export default function Home() {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const handleSearch = async (summoner: string, tagLine: string, region: string) => {
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
        `/api/live-game?summoner=${summoner}&tagLine=${tagLine}&region=${region}`
      );
      const data = await response.json();

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
    } catch (error) {
      setProgress(prev => ({
        ...prev!,
        completed: true,
        error: 'Failed to analyze matches'
      }));
    }
  };

  return (
    <main className="container mx-auto p-4">
      {/* Your existing search form */}
      
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