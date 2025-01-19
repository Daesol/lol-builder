import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGIONS } from '@/constants/game';
import { Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (summonerName: string, tagLine: string, region: string) => void;
  loading?: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [input, setInput] = useState('');
  const [region, setRegion] = useState('NA1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [summonerName, tagLine] = input.split('#');
    const finalTagLine = tagLine || region;
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
          className="col-span-2"
        />
        
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGIONS).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading} className="md:col-span-3">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>
    </form>
  );
};
