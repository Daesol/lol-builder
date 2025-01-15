import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui/card';
import type { ChampionPerformance } from '@/types/game';
import { ItemAnalysis } from './ItemAnalysis';

interface MatchHistoryProps {
  performance: ChampionPerformance;
}

export const MatchHistory = ({ performance }: MatchHistoryProps) => {
  const recentMatches = performance.matches.slice(0, 5); // Show last 5 matches

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days}d ago`;
    
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h ago`;
    
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getKDA = (kills: number, deaths: number, assists: number) => {
    const kda = ((kills + assists) / Math.max(deaths, 1)).toFixed(2);
    return `${kills}/${deaths}/${assists} (${kda})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMatches.map((match) => (
            <Card key={match.matchId}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-lg font-medium ${match.win ? 'text-green-400' : 'text-red-400'}`}>
                      {match.win ? 'Victory' : 'Defeat'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getTimeAgo(match.gameCreation)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      KDA: {getKDA(match.kills, match.deaths, match.assists)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <ItemAnalysis 
                    itemIds={match.itemBuild}
                    winRates={performance.commonItems}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Damage Dealt</p>
                    <p className="font-medium">{match.damageDealt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Gold Earned</p>
                    <p className="font-medium">{match.goldEarned.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
