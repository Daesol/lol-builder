import Image from 'next/image';
import { ddragonApi } from '@/lib/api/ddragon';
import type { ChampionAnalysisProps } from '@/types/game';

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
    .map(([itemId]) => Number(itemId));

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image 
              src={ddragonApi.getChampionIconUrl(participant.championName)}
              alt={participant.championName}
              width={48}
              height={48}
              className="rounded-lg"
              unoptimized
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/images/unknown-champion.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gray-900/80 rounded text-xs text-white">
              {analysis.matchCount}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{participant.gameName}</div>
                <div className="text-sm text-gray-500">#{participant.tagLine}</div>
              </div>
              <div className={`text-sm font-medium ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {winRate}% WR
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-green-500 font-medium">{avgKills}</span>
                  <span className="mx-1">/</span>
                  <span className="text-red-500 font-medium">{avgDeaths}</span>
                  <span className="mx-1">/</span>
                  <span className="text-blue-500 font-medium">{avgAssists}</span>
                </div>
                <div className="text-sm">
                  {avgDamage} DMG
                </div>
              </div>
            </div>
          </div>
        </div>

        {commonItems.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {commonItems.map((itemId) => (
              <Image
                key={itemId}
                src={ddragonApi.getItemIconUrl(itemId)}
                alt={`Item ${itemId}`}
                width={28}
                height={28}
                className="rounded-md hover:scale-110 transition-transform"
                unoptimized
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
