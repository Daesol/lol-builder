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
  const [input, setInput] = useState('');
  const [region, setRegion] = useState('NA1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Split the input into summoner name and tag
    const [summonerName, tagLine] = input.split('#');
    
    // If no tag is provided, use the region as tag
    const finalTagLine = tagLine || region;
    
    // Remove any special characters from summoner name
    const cleanSummonerName = summonerName.trim();
    
    onSearch(cleanSummonerName, finalTagLine, region);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Summoner Name (e.g. name#tag)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <Select value={region} onValueChange={setRegion}>
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
