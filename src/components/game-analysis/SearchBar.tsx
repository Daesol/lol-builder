import { useState } from 'react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';

interface SearchBarProps {
  onSearch: (summonerName: string, tagLine: string, region: string) => void;
  loading?: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [summonerName, setSummonerName] = useState('');
  const [tagLine, setTagLine] = useState('NA1');
  const [region, setRegion] = useState('NA1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(summonerName, tagLine, region);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Summoner Name"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
        />
        
        <Select value={tagLine} onValueChange={setTagLine}>
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NA1">NA</SelectItem>
            <SelectItem value="EUW1">EUW</SelectItem>
            <SelectItem value="KR">KR</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
};
