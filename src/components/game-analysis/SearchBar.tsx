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
import { REGIONS, REGION_FLAGS } from '@/constants/game';
import { Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (summonerName: string, tagLine: string, region: string) => void;
  loading?: boolean;
}

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [input, setInput] = useState('');
  const [region, setRegion] = useState('NA1');

  const handleSearch = () => {
    const [summonerName, tagLine] = input.split('#');
    if (summonerName && tagLine) {
      onSearch(summonerName.trim(), tagLine.trim(), region);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-4 max-w-xl mx-auto w-full">
        <Input
          placeholder="Game Name#Tag"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-64"
        />
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-24">
            <SelectValue>
              <span className="flex items-center gap-1">
                {REGION_FLAGS[region]} {region.replace(/[0-9]/g, '')}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGIONS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-1">
                  {REGION_FLAGS[key]} {key.replace(/[0-9]/g, '')}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSearch}
          disabled={loading || !input.includes('#')}
        >
          Search
        </Button>
      </div>
    </div>
  );
};
