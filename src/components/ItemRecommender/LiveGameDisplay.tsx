'use client';

import { useState } from 'react';
import { LiveGame, LiveGameAnalysis } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';
import { analyzeLiveGame } from '@/lib/riotApiClient';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  const [analysis, setAnalysis] = useState<LiveGameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('LiveGameDisplay received:', { liveGame, region });

  const blueTeam = liveGame.participants.filter(p => p.teamId === 100);
  const redTeam = liveGame.participants.filter(p => p.teamId === 200);

  console.log('Teams split:', { 
    blueTeamSize: blueTeam.length, 
    redTeamSize: redTeam.length,
    blueTeam,
    redTeam
  });

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const gameAnalysis = await analyzeLiveGame(liveGame, region);
      console.log('Analysis completed:', gameAnalysis);
      setAnalysis(gameAnalysis);
    } catch (err) {
      console.error('Error analyzing live game:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze game');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getParticipantAnalysis = (summonerId: string) => {
    return analysis?.participants.find(p => p.summonerId === summonerId)?.championAnalysis;
  };

  return (
    <div className="space-y-4">
      {/* Player Analysis Button */}
      {!analysis && !isAnalyzing && (
        <div className="flex justify-center">
          <Button 
            onClick={startAnalysis}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Analyze All Players
          </Button>
        </div>
      )}

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <Alert>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Analyzing all players...</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Analysis Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Teams Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blue Team */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-blue-400">Blue Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blueTeam.map((participant) => (
              <ParticipantCard
                key={participant.summonerId}
                participant={participant}
                region={region}
                enableAnalysis={!analysis}
                initialAnalysis={getParticipantAnalysis(participant.summonerId)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Red Team */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base text-red-400">Red Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {redTeam.map((participant) => (
              <ParticipantCard
                key={participant.summonerId}
                participant={participant}
                region={region}
                enableAnalysis={!analysis}
                initialAnalysis={getParticipantAnalysis(participant.summonerId)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-slate-800 rounded text-xs text-gray-300">
        <pre>
          Game Mode: {liveGame.gameMode}
          Total Participants: {liveGame.participants.length}
          Blue Team: {blueTeam.length}
          Red Team: {redTeam.length}
        </pre>
      </div>
    </div>
  );
};