// src/components/ItemRecommender/SearchSection.tsx
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
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Summoner Name"
        value={summonerName}
        onChange={(e) => onSummonerNameChange(e.target.value)}
        className="flex-1 bg-gray-800 border-gray-700 text-white"
      />
      <Input
        placeholder="Tag (e.g., NA1)"
        value={tagLine}
        onChange={(e) => onTagLineChange(e.target.value)}
        className="w-full sm:w-32 bg-gray-800 border-gray-700 text-white"
      />
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
      >
        <option value="NA1">NA</option>
        <option value="EUW1">EUW</option>
        <option value="KR">KR</option>
        <option value="BR1">BR</option>
      </select>
      <Button
        onClick={onSearch}
        disabled={loading}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Loading...' : 'Search'}
      </Button>
    </div>
  );
};

