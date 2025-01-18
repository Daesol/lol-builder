import { useState } from 'react';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Loader2 } from 'lucide-react';
import type { ChampionAnalysisProps, ChampionPerformance } from '@/types/game';

export const ChampionAnalysis = ({ participant, analysis }: ChampionAnalysisProps) => {
  const [performance, setPerformance] = useState<ChampionPerformance | null>(analysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderStats = () => {
    if (!performance) return null;

    const winRate = ((performance.wins / performance.matchCount) * 100).toFixed(1);
    const avgKDA = (
      (performance.totalKills + performance.totalAssists) /
      Math.max(performance.totalDeaths, 1)
    ).toFixed(2);

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="font-medium">{winRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">KDA</p>
          <p className="font-medium">{avgKDA}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Matches</p>
          <p className="font-medium">{performance.matchCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Damage</p>
          <p className="font-medium">
            {Math.round(performance.totalDamageDealt / performance.matchCount).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{participant.summonerName}</h4>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {renderStats()}
      </CardContent>
    </Card>
  );
};
