import { useState, useEffect } from 'react';
import { Card } from '@/components/common/ui/card';
import { ChampionAnalysis } from './ChampionAnalysis';
import type { LiveGame, LiveGameAnalysis } from '@/types/game';
import { Loader2 } from 'lucide-react';

interface LiveGameProps {
  game: LiveGame;
  region: string;
}

export const LiveGameDisplay = ({ game, region }: LiveGameProps) => {
  const [analysis, setAnalysis] = useState<LiveGameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeParticipants = async () => {
      console.log('Starting participant analysis...', { game, region });
      setLoading(true);
      try {
        // Analyze all participants
        const participantAnalyses = await Promise.all(
          game.participants.map(async (participant) => {
            try {
              console.log('Analyzing participant:', participant.summonerName);
              const response = await fetch(
                `/api/champion-analysis?${new URLSearchParams({
                  puuid: participant.puuid,
                  championId: participant.championId.toString(),
                  region
                })}`
              );
              
              if (!response.ok) {
                console.error(`Analysis failed for ${participant.summonerName}:`, await response.text());
                return {
                  puuid: participant.puuid,
                  summonerName: participant.summonerName,
                  teamId: participant.teamId,
                  analysis: {
                    matchCount: 0,
                    wins: 0,
                    totalKills: 0,
                    totalDeaths: 0,
                    totalAssists: 0,
                    totalDamageDealt: 0,
                    commonItems: {},
                    commonRunes: { primaryTree: 0, secondaryTree: 0, keystone: 0 }
                  }
                };
              }
              
              const performance = await response.json();
              console.log('Participant analysis complete:', {
                summonerName: participant.summonerName,
                performance
              });
              
              return {
                puuid: participant.puuid,
                summonerName: participant.summonerName,
                teamId: participant.teamId,
                analysis: performance
              };
            } catch (error) {
              console.error(`Error analyzing ${participant.summonerName}:`, error);
              return {
                puuid: participant.puuid,
                summonerName: participant.summonerName,
                teamId: participant.teamId,
                analysis: {
                  matchCount: 0,
                  wins: 0,
                  totalKills: 0,
                  totalDeaths: 0,
                  totalAssists: 0,
                  totalDamageDealt: 0,
                  commonItems: {},
                  commonRunes: { primaryTree: 0, secondaryTree: 0, keystone: 0 }
                }
              };
            }
          })
        );

        console.log('All participants analyzed:', participantAnalyses);
        setAnalysis({
          blueTeam: participantAnalyses.filter(p => p.teamId === 100),
          redTeam: participantAnalyses.filter(p => p.teamId === 200)
        });
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
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Analyzing participants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
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
