import { useState, useEffect } from 'react';
import { Card } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { ChampionAnalysis } from './ChampionAnalysis';
import type { LiveGame, LiveGameAnalysis } from '@/types/game';
import { analyzeLiveGame } from '@/lib/utils/analysis';

interface LiveGameProps {
  game: LiveGame;
  region: string;
}

export const LiveGameDisplay = ({ game, region }: LiveGameProps) => {
  const [analysis, setAnalysis] = useState<LiveGameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeParticipants = async () => {
      setLoading(true);
      try {
        // Analyze all participants
        const participantAnalyses = await Promise.all(
          game.participants.map(async (participant) => {
            const performance = await fetch(
              `/api/champion-analysis?${new URLSearchParams({
                puuid: participant.puuid,
                championId: participant.championId.toString(),
                region: region
              })}`
            ).then(res => res.json());
            
            return {
              puuid: participant.puuid,
              summonerName: participant.summonerName,
              teamId: participant.teamId,
              analysis: performance
            };
          })
        );

        setAnalysis({
          blueTeam: participantAnalyses.filter(p => p.teamId === 100),
          redTeam: participantAnalyses.filter(p => p.teamId === 200)
        });
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeParticipants();
  }, [game, region]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div>Analyzing participant history...</div>
      ) : (
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
      )}
    </div>
  );
};
