
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

  // This effect updates local state ONLY when the hole number changes
  useEffect(() => {
    console.log("HoleStats: New hole detected, updating local state:", data.holeNumber);
    
    // Only update local state when hole number changes
    setLocalPar(data.par || 4);
    setLocalDistance(data.distance || '');
    
    // For score fields, only update if they have actual values
    setLocalScore(data.score > 0 ? data.score : '');
    setLocalPutts(data.putts > 0 ? data.putts : '');
  }, [data.holeNumber]); // Only dependency is hole number, not entire data object

  const handleParChange = (value: string) => {
    if (!value) return;
    
    const parsedValue = parseInt(value) || 3;
    console.log(`Changing par to ${parsedValue}`);
    setLocalPar(parsedValue);
    
    // Par and distance are course metadata, so they should update immediately
    onDataChange('par', parsedValue);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDistance(value);
    
    // Par and distance are course metadata, so they should update immediately
    const parsedValue = parseInt(value) || 0;
    onDataChange('distance', parsedValue);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Setting local score to ${value}`);
    
    // ONLY update local state, don't notify parent
    setLocalScore(value);
  };

  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Setting local putts to ${value}`);
    
    // ONLY update local state, don't notify parent
    setLocalPutts(value);
  };

  // New function to prepare all data for saving
  // This will be called by the parent when navigation happens
  const prepareDataForSave = () => {
    // Get current local values
    const scoreValue = localScore !== '' ? parseInt(String(localScore)) || 0 : 0;
    const puttsValue = localPutts !== '' ? parseInt(String(localPutts)) || 0 : 0;
    
    console.log(`Preparing data for save: score=${scoreValue}, putts=${puttsValue}`);
    
    // Create a complete data object for saving
    const dataToSave = {
      ...data,
      score: scoreValue,
      putts: puttsValue,
      par: localPar,
      distance: typeof localDistance === 'string' ? parseInt(localDistance) || 0 : localDistance
    };
    
    console.log("Complete data object for saving:", dataToSave);
    
    // Return the complete data object
    return dataToSave;
  };

  // Expose the save function via ref or prop
  // This makes it accessible to the parent component
  if (typeof data.prepareForSave === 'function') {
    data.prepareForSave = prepareDataForSave;
  }

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
