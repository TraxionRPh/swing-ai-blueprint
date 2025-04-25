
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
  const [localPar, setLocalPar] = useState<number>(data.par);
  const [localDistance, setLocalDistance] = useState<number | string>(data.distance || '');

  useEffect(() => {
    // Update local state when external data changes (e.g. when hole changes)
    setLocalPar(data.par);
    setLocalDistance(data.distance || '');
  }, [data.holeNumber, data.par, data.distance]);

  const handleParChange = (value: string) => {
    const parsedValue = parseInt(value) || 3;
    setLocalPar(parsedValue);
    onDataChange('par', parsedValue);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDistance(value);
    onDataChange('distance', parseInt(value) || 0);
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
          value={data.score || ''} 
          onChange={e => onDataChange('score', parseInt(e.target.value) || 0)} 
          min={1} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="putts">Putts</Label>
        <Input 
          id="putts" 
          type="number" 
          placeholder="Enter putts" 
          value={data.putts || ''} 
          onChange={e => onDataChange('putts', parseInt(e.target.value) || 0)} 
          min={0} 
        />
      </div>
    </div>
  );
};
