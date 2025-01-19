import { useState, useEffect } from 'react';
import { Card } from '@/components/common/ui/card';
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Analyzing match history...</span>
        </div>
        <div className="w-full max-w-2xl space-y-3">
          {game.participants.map((participant) => (
            <div key={participant.puuid} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium truncate">
                  {participant.riotIdGameName}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${progress[participant.puuid] || 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-14 text-right">
                  {Math.round(progress[participant.puuid] || 0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-red-600 dark:text-red-400 whitespace-pre-line">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="overflow-hidden border-t-4 border-blue-500">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-blue-500 mb-4">Blue Team</h3>
          <div className="space-y-3">
            {analysis?.blueTeam.map(participant => (
              <ChampionAnalysis
                key={participant.puuid}
                participant={participant}
                analysis={participant.analysis}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-t-4 border-red-500">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-red-500 mb-4">Red Team</h3>
          <div className="space-y-3">
            {analysis?.redTeam.map(participant => (
              <ChampionAnalysis
                key={participant.puuid}
                participant={participant}
                analysis={participant.analysis}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
