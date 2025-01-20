import Image from 'next/image';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ddragonApi } from '@/lib/api/ddragon';

interface RuneAnalysisProps {
  primaryTree: number;
  primaryRunes: number[];
  secondaryTree: number;
  secondaryRunes: number[];
  winRates?: Record<number, {
    count: number;
    winCount: number;
  }>;
}

export const RuneAnalysis = ({ 
  primaryTree, 
  primaryRunes, 
  secondaryTree, 
  secondaryRunes,
  winRates 
}: RuneAnalysisProps) => {
  return (
    <div className="flex gap-4">
      {/* Primary Runes */}
      <div className="flex gap-1">
        <div className="relative w-8 h-8">
          <Image
            src={ddragonApi.getRuneTreeIconUrl(primaryTree)}
            alt="Primary Rune"
            fill
            className="rounded-full"
            unoptimized
          />
        </div>
        {primaryRunes.map((runeId) => (
          <div key={runeId} className="relative w-6 h-6">
            <Image
              src={ddragonApi.getRuneIconUrl(runeId)}
              alt="Rune"
              fill
              className="rounded-full"
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Secondary Runes */}
      <div className="flex gap-1">
        <div className="relative w-6 h-6">
          <Image
            src={ddragonApi.getRuneTreeIconUrl(secondaryTree)}
            alt="Secondary Rune"
            fill
            className="rounded-full opacity-75"
            unoptimized
          />
        </div>
        {secondaryRunes.map((runeId) => (
          <div key={runeId} className="relative w-6 h-6">
            <Image
              src={ddragonApi.getRuneIconUrl(runeId)}
              alt="Rune"
              fill
              className="rounded-full"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}; 