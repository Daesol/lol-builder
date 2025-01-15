import { useState } from 'react';
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

  const blueTeam = game.participants.filter(p => p.teamId === 100);
  const redTeam = game.participants.filter(p => p.teamId === 200);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeLiveGame(game, region);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Live Game Analysis</h2>
        {!analysis && (
          <Button onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Game'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <Card>
          <div className="p-4">
            <h3 className="text-blue-400 font-bold mb-4">Blue Team</h3>
            {blueTeam.map(participant => (
              <ChampionAnalysis
                key={participant.summonerId}
                participant={{
                  puuid: participant.puuid,
                  summonerId: participant.summonerId,
                  summonerName: participant.summonerName,
                  championId: participant.championId,
                  teamId: participant.teamId
                }}
                region={region}
              />
            ))}
          </div>
        </Card>

        {/* Red Team */}
        <Card>
          <div className="p-4">
            <h3 className="text-red-400 font-bold mb-4">Red Team</h3>
            {redTeam.map(participant => (
              <ChampionAnalysis
                key={participant.summonerId}
                participant={{
                  puuid: participant.puuid,
                  summonerId: participant.summonerId,
                  summonerName: participant.summonerName,
                  championId: participant.championId,
                  teamId: participant.teamId
                }}
                region={region}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
