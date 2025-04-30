
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, useState } from "react";

interface HoleStatsProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleStats = ({ data, onDataChange }: HoleStatsProps) => {
  const [localPar, setLocalPar] = useState<number>(data.par || 4);
  const [localDistance, setLocalDistance] = useState<number | string>(data.distance || '');
  const [localScore, setLocalScore] = useState<number | string>(data.score || '');
  const [localPutts, setLocalPutts] = useState<number | string>(data.putts || '');

  // This effect ensures local state is updated when the hole number changes
  useEffect(() => {
    console.log("HoleStats: Updating from hole data:", data);
    setLocalPar(data.par || 4);
    setLocalDistance(data.distance || '');
    
    // Only set actual values, not zeros
    setLocalScore(data.score > 0 ? data.score : '');
    setLocalPutts(data.putts > 0 ? data.putts : '');
  }, [data.holeNumber, data]);

  const handleParChange = (value: string) => {
    if (!value) return;
    
    const parsedValue = parseInt(value) || 3;
    console.log(`Changing par to ${parsedValue}`);
    setLocalPar(parsedValue);
    onDataChange('par', parsedValue);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDistance(value);
    const parsedValue = parseInt(value) || 0;
    onDataChange('distance', parsedValue);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Setting local score to ${value}`);
    setLocalScore(value);
    
    // Simply store the entered value in the parent component's data object
    // Only parse and save if not empty
    if (value !== '') {
      const parsedValue = parseInt(value) || 0;
      onDataChange('score', parsedValue);
    }
  };

  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Setting local putts to ${value}`);
    setLocalPutts(value);
    
    // Simply store the entered value in the parent component's data object
    // Only parse and save if not empty
    if (value !== '') {
      const parsedValue = parseInt(value) || 0;
      onDataChange('putts', parsedValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Par</Label>
        <ToggleGroup 
          type="single" 
          value={localPar.toString()}
          onValueChange={handleParChange}
          className="justify-start"
        >
          {[3, 4, 5].map((par) => (
            <ToggleGroupItem key={par} value={par.toString()}>
              {par}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="distance">Yards</Label>
        <Input 
          id="distance" 
          type="number" 
          placeholder="Enter yards" 
          value={localDistance} 
          onChange={handleDistanceChange} 
          min={0}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="score">Score</Label>
        <Input 
          id="score" 
          type="number" 
          placeholder="Enter score" 
          value={localScore} 
          onChange={handleScoreChange} 
          min={1} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="putts">Putts</Label>
        <Input 
          id="putts" 
          type="number" 
          placeholder="Enter putts" 
          value={localPutts} 
          onChange={handlePuttsChange} 
          min={0} 
        />
      </div>
    </div>
  );
};
