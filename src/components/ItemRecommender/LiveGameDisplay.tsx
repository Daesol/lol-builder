'use client';

import { useState } from 'react';
import { LiveGame, LiveGameAnalysis, ChampionPerformance } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';
import { analyzeLiveGame } from '@/lib/riotApiClient';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LiveGameDisplayProps {
  liveGame: LiveGame;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, region }) => {
  const [analysis, setAnalysis] = useState<LiveGameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blueTeam = liveGame.participants.filter(p => p.teamId === 100);
  const redTeam = liveGame.participants.filter(p => p.teamId === 200);

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

  const getParticipantAnalysis = (summonerId: string): ChampionPerformance | undefined => {
    return analysis?.participants.find(p => p.summonerId === summonerId)?.championAnalysis;
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold text-lg">
          Live Game - {liveGame.gameMode} ({liveGame.gameType})
        </h3>
        {!analysis && !isAnalyzing && (
          <Button 
            onClick={startAnalysis}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Analyze All Players
          </Button>
        )}
      </div>

      {isAnalyzing && (
        <Alert>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Analyzing all players... This might take a moment.</AlertDescription>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div>
          <h4 className="text-blue-400 font-medium mb-3">Blue Team</h4>
          <div className="space-y-4">
            {blueTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
                enableAnalysis={!analysis} // Only enable individual analysis if we haven't analyzed all
                initialAnalysis={getParticipantAnalysis(participant.summonerId)}
              />
            ))}
          </div>
        </div>

        {/* Red Team */}
        <div>
          <h4 className="text-red-400 font-medium mb-3">Red Team</h4>
          <div className="space-y-4">
            {redTeam.map((participant) => (
              <ParticipantCard 
                key={participant.summonerId} 
                participant={participant}
                region={region}
                enableAnalysis={!analysis} // Only enable individual analysis if we haven't analyzed all
                initialAnalysis={getParticipantAnalysis(participant.summonerId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};