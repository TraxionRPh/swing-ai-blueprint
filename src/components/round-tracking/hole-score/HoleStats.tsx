
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, useState, useCallback } from "react";

interface HoleStatsProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleStats = ({ data, onDataChange }: HoleStatsProps) => {
  const [localPar, setLocalPar] = useState<number>(data.par);
  const [localDistance, setLocalDistance] = useState<number | string>(data.distance || '');
  const [localScore, setLocalScore] = useState<number | string>(data.score || '');
  const [localPutts, setLocalPutts] = useState<number | string>(data.putts || '');

  // This effect ensures local state is updated only when the hole number changes
  // This prevents overwriting user input when parent state changes for the same hole
  useEffect(() => {
    console.log("HoleStats: Hole number changed to", data.holeNumber);
    setLocalPar(data.par);
    setLocalDistance(data.distance || '');
    setLocalScore(data.score || '');
    setLocalPutts(data.putts || '');
  }, [data.holeNumber]);

  const handleParChange = (value: string) => {
    const parsedValue = parseInt(value) || 3;
    console.log(`Changing par to ${parsedValue}`);
    setLocalPar(parsedValue);
    onDataChange('par', parsedValue);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDistance(value);
    onDataChange('distance', parseInt(value) || 0);
  };

  const handleScoreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalScore(value);
    onDataChange('score', parseInt(value) || 0);
  }, [onDataChange]);

  const handlePuttsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalPutts(value);
    onDataChange('putts', parseInt(value) || 0);
  }, [onDataChange]);

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
