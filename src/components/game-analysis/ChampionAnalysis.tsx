import Image from 'next/image';
import type { ParticipantAnalysis } from '@/types/game';

interface ChampionAnalysisProps {
  participant: ParticipantAnalysis;
  analysis: {
    matchCount: number;
    championMatchCount: number;
    wins: number;
    championWins: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalDamageDealt: number;
    championStats: {
      kills: number;
      deaths: number;
      assists: number;
      damageDealt: number;
    };
    commonItems: Record<number, { count: number; winCount: number }>;
    commonRunes: {
      primaryTree: number;
      secondaryTree: number;
      keystone: number;
    };
  };
}

export const ChampionAnalysis: React.FC<ChampionAnalysisProps> = ({
  participant,
  analysis
}) => {
  // Calculate averages
  const avgKills = analysis.matchCount ? (analysis.totalKills / analysis.matchCount).toFixed(1) : '0';
  const avgDeaths = analysis.matchCount ? (analysis.totalDeaths / analysis.matchCount).toFixed(1) : '0';
  const avgAssists = analysis.matchCount ? (analysis.totalAssists / analysis.matchCount).toFixed(1) : '0';
  const avgDamage = analysis.matchCount ? Math.round(analysis.totalDamageDealt / analysis.matchCount).toLocaleString() : '0';
  const winRate = analysis.matchCount ? Math.round((analysis.wins / analysis.matchCount) * 100) : 0;

  // Get most common items
  const commonItems = Object.entries(analysis.commonItems)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3)
    .map(([itemId]) => itemId);

  return (
    <div className="mb-4 last:mb-0 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <Image 
          src={`/images/champion/${participant.championId}.png`}
          alt={participant.championName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <div className="font-semibold">{participant.gameName}</div>
          <div className="text-sm text-gray-500">#{participant.tagLine}</div>
        </div>
        <span className={`ml-auto text-sm ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
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

      {commonItems.length > 0 && (
        <div className="mt-2 flex gap-1">
          {commonItems.map((itemId) => (
            <Image
              key={itemId}
              src={`/images/item/${itemId}.png`}
              alt={`Item ${itemId}`}
              width={24}
              height={24}
              className="rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};
