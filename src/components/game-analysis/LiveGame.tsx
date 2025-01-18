import { useState, useEffect } from 'react';
import { Card } from '@/components/common/ui/card';
import { ChampionAnalysis } from './ChampionAnalysis';
import type { LiveGameAnalysis, LiveGameParticipant, LiveGame as LiveGameType, ParticipantAnalysis } from '@/types/game';
import { Loader2 } from 'lucide-react';

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
            championName: participant.championName || '',
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
        // Analyze all participants in parallel
        const analysisPromises = game.participants.map(participant => 
          analyzeParticipant(participant).catch(error => {
            console.error(`Error analyzing ${participant.riotIdGameName}:`, error);
            setError(prev => {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              return prev ? `${prev}\n${errorMessage}` : errorMessage;
            });
            return null; // Return null for failed analyses
          })
        );

        const analyses = (await Promise.all(analysisPromises)).filter(Boolean); // Remove null values

        if (analyses.length > 0) {
          setAnalysis({
            blueTeam: analyses.filter(p => p.teamId === 100),
            redTeam: analyses.filter(p => p.teamId === 200)
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
      <div className="flex flex-col items-center p-8 space-y-4">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Analyzing participants...</span>
        </div>
        <div className="w-full max-w-md space-y-2">
          {game.participants.map((participant) => (
            <div key={participant.puuid} className="flex items-center">
              <span className="w-48 truncate">
                {participant.riotIdGameName}#{participant.riotIdTagline}
              </span>
              <div className="flex-1 h-2 ml-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${progress[participant.puuid] || 0}%`
                  }}
                />
              </div>
              <span className="ml-2 w-12 text-sm">
                {Math.round(progress[participant.puuid] || 0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 whitespace-pre-line">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blue Team */}
      <Card>
        <div className="p-4">
          <h3 className="text-blue-400 font-bold mb-4">Blue Team</h3>
          {analysis?.blueTeam.map(participant => (
            <ChampionAnalysis
              key={participant.puuid}
              participant={participant}
              analysis={participant.analysis}
            />
          ))}
        </div>
      </Card>

      {/* Red Team */}
      <Card>
        <div className="p-4">
          <h3 className="text-red-400 font-bold mb-4">Red Team</h3>
          {analysis?.redTeam.map(participant => (
            <ChampionAnalysis
              key={participant.puuid}
              participant={participant}
              analysis={participant.analysis}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
