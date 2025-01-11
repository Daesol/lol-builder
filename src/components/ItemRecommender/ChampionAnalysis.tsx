// src/components/ItemRecommender/ChampionAnalysis.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MatchDetail {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  goldEarned: number;
  itemBuild: number[];
}

interface ChampionStats {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  winRate: string;
  avgKDA: string;
  avgDamage: number;
  avgGold: number;
  matches: MatchDetail[];
}

interface ChampionAnalysisProps {
  participant: {
    puuid: string;
    summonerId: string;
    summonerName: string;
    championId: number;
    teamId: number;
  };
  region: string;
}

export const ChampionAnalysis: React.FC<ChampionAnalysisProps> = ({ participant, region }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChampionStats[] | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<ChampionStats | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/participant-analysis?puuid=${participant.puuid}&summonerId=${participant.summonerId}&region=${region}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data);
      const currentChampData = data.find((c: ChampionStats) => c.championId === participant.championId);
      if (currentChampData) {
        setSelectedChampion(currentChampData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderMatchList = (matches: MatchDetail[]) => {
    return matches.slice(0, 5).map((match) => (
      <div
        key={match.matchId}
        className={`p-3 rounded-lg ${match.win ? 'bg-green-900/30' : 'bg-red-900/30'}`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className={match.win ? 'text-green-400' : 'text-red-400'}>
            {match.win ? 'Victory' : 'Defeat'}
          </span>
          <span className="text-gray-300">
            {Math.floor(match.gameDuration / 60)}:{(match.gameDuration % 60)
              .toString()
              .padStart(2, '0')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">
            {`${match.kills}/${match.deaths}/${match.assists}`} KDA
          </span>
          <span className="text-gray-300">
            {formatTime(match.gameCreation)}
          </span>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {`${(match.totalDamageDealt / 1000).toFixed(1)}k damage • ${(match.goldEarned / 1000).toFixed(1)}k gold`}
        </div>
      </div>
    ));
  };

  if (!analysis && !loading && !error) {
    return (
      <Button onClick={fetchAnalysis} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Champion History'
        )}
      </Button>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-300">Analyzing champion history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400">
          Champion Analysis - {participant.summonerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Most played champions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.slice(0, 3).map((champion) => (
              <Card 
                key={champion.championId}
                className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors
                  ${selectedChampion?.championId === champion.championId ? 'ring-2 ring-blue-500' : ''}
                  hover:bg-gray-600`}
                onClick={() => setSelectedChampion(champion)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">{champion.championName}</h4>
                    <span className="text-sm text-gray-300">{champion.games} games</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400">Win Rate</div>
                      <div className="text-white">{champion.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">KDA</div>
                      <div className="text-white">{champion.avgKDA}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected champion details */}
          {selectedChampion && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-4">
                {selectedChampion.championName} Performance Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-gray-400 text-sm">Games Played</div>
                  <div className="text-white font-medium">{selectedChampion.games}</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-gray-400 text-sm">Win Rate</div>
                  <div className="text-white font-medium">{selectedChampion.winRate}%</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-gray-400 text-sm">Avg KDA</div>
                  <div className="text-white font-medium">{selectedChampion.avgKDA}</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="text-gray-400 text-sm">Avg Damage</div>
                  <div className="text-white font-medium">{selectedChampion.avgDamage.toLocaleString()}</div>
                </div>
              </div>

              {/* Recent matches */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Recent Matches</h4>
                {renderMatchList(selectedChampion.matches)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};