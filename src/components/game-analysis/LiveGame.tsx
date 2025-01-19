import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChampionAnalysis } from './ChampionAnalysis';
import type { LiveGameAnalysis, LiveGameParticipant, LiveGame as LiveGameType, ParticipantAnalysis } from '@/types/game';
import { Loader2 } from 'lucide-react';
import { initChampionMapping, getChampionName } from '@/lib/utils/champion';

interface LiveGameDisplayProps {
  game: LiveGameType;
  region: string;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ game, region }) => {
  const [analysis, setAnalysis] = useState<LiveGameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initChampionMapping();
  }, []);

  useEffect(() => {
    const analyzeParticipant = async (participant: LiveGameParticipant) => {
      let sessionId = '';
      let retryCount = 0;
      const MAX_RETRIES = 3;
      
      while (true) {
        try {
          const response = await fetch(
            `/api/champion-analysis?${new URLSearchParams({
              puuid: participant.puuid,
              championId: participant.championId.toString(),
              region,
              ...(sessionId ? { sessionId } : {})
            })}`,
            {
              // Add timeout to prevent hanging requests
              signal: AbortSignal.timeout(15000) // 15 second timeout
            }
          );

          if (!response.ok) {
            if (response.status === 504) {
              // If we have a session ID, we can retry with it
              if (sessionId && retryCount < MAX_RETRIES) {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                continue;
              }
              throw new Error(`Analysis timeout for ${participant.riotIdGameName}. Please try again.`);
            }
            throw new Error(await response.text());
          }

          const data = await response.json();
          
          if (data.sessionId) {
            sessionId = data.sessionId;
            setProgress(prev => ({
              ...prev,
              [participant.puuid]: (data.processed / data.total) * 100
            }));
            
            if (!data.completed) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          }

          return {
            puuid: participant.puuid,
            gameName: participant.riotIdGameName,
            tagLine: participant.riotIdTagline,
            teamId: participant.teamId,
            championId: participant.championId,
            championName: getChampionName(participant.championId),
            analysis: data
          };
        } catch (error) {
          if (error instanceof Error) {
            // If we have a session ID, we can retry
            if (sessionId && retryCount < MAX_RETRIES) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
            throw new Error(`Failed to analyze ${participant.riotIdGameName}: ${error.message}`);
          }
          throw error;
        }
      }
    };

    const analyzeParticipants = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        const analyses = await Promise.all(
          game.participants.map(async (participant) => {
            try {
              return await analyzeParticipant(participant);
            } catch (error) {
              console.error(`Error analyzing ${participant.riotIdGameName}:`, error);
              setError(prev => {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return prev ? `${prev}\n${errorMessage}` : errorMessage;
              });
              return null;
            }
          })
        );

        const validAnalyses = analyses.filter(Boolean);
        if (validAnalyses.length > 0) {
          setAnalysis({
            blueTeam: validAnalyses.filter((p): p is ParticipantAnalysis => p !== null && p.teamId === 100),
            redTeam: validAnalyses.filter((p): p is ParticipantAnalysis => p !== null && p.teamId === 200)
          });
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        setError(error instanceof Error ? error.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    analyzeParticipants();
  }, [game, region]);

  if (loading) {
    return (
      <div className="flex flex-col items-center p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg font-medium">Analyzing match history...</span>
        </div>
        <div className="w-full max-w-2xl space-y-4">
          {game.participants.map((participant) => (
            <Card key={participant.puuid} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">
                    {participant.riotIdGameName}
                  </span>
                  <span className="text-sm text-muted-foreground w-14 text-right">
                    {Math.round(progress[participant.puuid] || 0)}%
                  </span>
                </div>
                <Progress 
                  value={progress[participant.puuid] || 0} 
                  className="h-2"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="whitespace-pre-line">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-500">Blue Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis?.blueTeam.map(participant => (
            <ChampionAnalysis
              key={participant.puuid}
              participant={participant}
              analysis={participant.analysis}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Red Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis?.redTeam.map(participant => (
            <ChampionAnalysis
              key={participant.puuid}
              participant={participant}
              analysis={participant.analysis}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
