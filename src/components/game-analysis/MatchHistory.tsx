import { Card, CardContent } from '@/components/common/ui/card';
import { ItemAnalysis } from './ItemAnalysis';
import type { ChampionPerformance } from '@/types/game';

interface MatchHistoryProps {
  performance: ChampionPerformance;
}

export const MatchHistory = ({ performance }: MatchHistoryProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400">Win Rate</p>
            <p className="font-medium">
              {((performance.wins / performance.matchCount) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">KDA</p>
            <p className="font-medium">
              {((performance.totalKills + performance.totalAssists) / 
                Math.max(performance.totalDeaths, 1)).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Common Items</h4>
          <ItemAnalysis itemIds={Object.keys(performance.commonItems).map(Number)} />
        </div>
      </CardContent>
    </Card>
  );
};
