import type { ParticipantAnalysis } from '@/types/game';

interface ChampionAnalysisProps {
  participant: {
    summonerName: string;
    puuid: string;
    teamId: number;
  };
  analysis: {
    matchCount: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalDamageDealt: number;
  };
}

export const ChampionAnalysis = ({ participant, analysis }: ChampionAnalysisProps) => {
  // Calculate averages
  const avgKills = analysis.matchCount ? (analysis.totalKills / analysis.matchCount).toFixed(1) : '0';
  const avgDeaths = analysis.matchCount ? (analysis.totalDeaths / analysis.matchCount).toFixed(1) : '0';
  const avgAssists = analysis.matchCount ? (analysis.totalAssists / analysis.matchCount).toFixed(1) : '0';
  const avgDamage = analysis.matchCount ? Math.round(analysis.totalDamageDealt / analysis.matchCount).toLocaleString() : '0';
  const winRate = analysis.matchCount ? Math.round((analysis.wins / analysis.matchCount) * 100) : 0;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">{participant.summonerName}</span>
        <span className={`text-sm ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
          {winRate}% WR ({analysis.matchCount} games)
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-green-500">{avgKills}</span> / 
            <span className="text-red-500">{avgDeaths}</span> / 
            <span className="text-blue-500">{avgAssists}</span> KDA
          </div>
          <div className="text-right">
            {avgDamage} DMG
          </div>
        </div>
      </div>
    </div>
  );
};
