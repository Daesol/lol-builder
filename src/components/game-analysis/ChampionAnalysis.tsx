import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ddragonApi } from '@/lib/api/ddragon';
import type { ChampionAnalysisProps } from '@/types/game';
import { ItemAnalysis } from './ItemAnalysis';

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

  // Get most common items (increase from 3 to 6)
  const commonItems = Object.entries(analysis.commonItems)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 6)  // Changed from 3 to 6
    .map(([itemId]) => Number(itemId));

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="relative cursor-pointer">
                <Image 
                  src={ddragonApi.getChampionIconUrl(participant.championName)}
                  alt={participant.championName}
                  width={40}  // Reduced from 48
                  height={40} // Reduced from 48
                  className="rounded-lg"
                  unoptimized
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/unknown-champion.png';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-background/80 rounded text-[10px]">
                  {analysis.matchCount}
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <h4 className="font-semibold">{participant.championName}</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.matchCount} games analyzed
              </p>
            </HoverCardContent>
          </HoverCard>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{participant.gameName}</div>
                <div className="text-sm text-muted-foreground">
                  {participant.championName} • #{participant.tagLine}
                </div>
              </div>
              <div className={`text-sm font-medium ${winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {winRate}% WR
              </div>
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
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
          <div className="mt-2">
            <ItemAnalysis itemIds={commonItems} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
