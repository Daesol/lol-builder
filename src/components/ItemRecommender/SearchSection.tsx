// components/ItemRecommender/SearchSection.tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchSectionProps {
  summonerName: string;
  tagLine: string;
  region: string;
  loading: boolean;
  onSummonerNameChange: (value: string) => void;
  onTagLineChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  summonerName,
  tagLine,
  region,
  loading,
  onSummonerNameChange,
  onTagLineChange,
  onRegionChange,
  onSearch,
}) => {
  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Gamename"
        value={summonerName}
        onChange={(e) => onSummonerNameChange(e.target.value)}
        className="flex-1 border-slate-800 bg-slate-900 text-slate-100"
      />
      <Input
        placeholder="#TAG"
        value={tagLine}
        onChange={(e) => onTagLineChange(e.target.value)}
        className="w-24 border-slate-800 bg-slate-900 text-slate-100"
      />
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="rounded-md border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
      >
        <option value="NA1">NA</option>
        <option value="EUW1">EUW</option>
        <option value="KR">KR</option>
      </select>
      <Button
        onClick={onSearch}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search
          </>
        )}
      </Button>
    </div>
  );
};