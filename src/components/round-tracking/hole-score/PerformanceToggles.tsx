
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { HoleData } from "@/types/round-tracking";
import { useCallback, useState, useEffect } from "react";

interface PerformanceTogglesProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: boolean) => void;
}

export const PerformanceToggles = ({ data, onDataChange }: PerformanceTogglesProps) => {
  const [fairwayHit, setFairwayHit] = useState<boolean>(!!data.fairwayHit);
  const [greenInRegulation, setGreenInRegulation] = useState<boolean>(!!data.greenInRegulation);

  // Only update local state when the hole number changes
  useEffect(() => {
    console.log("PerformanceToggles: Hole number changed to", data.holeNumber);
    setFairwayHit(!!data.fairwayHit);
    setGreenInRegulation(!!data.greenInRegulation);
  }, [data.holeNumber]);

  const handleFairwayChange = useCallback((checked: boolean) => {
    console.log(`Setting fairway hit to ${checked}`);
    setFairwayHit(checked);
    onDataChange('fairwayHit', checked);
  }, [onDataChange]);

  const handleGreenChange = useCallback((checked: boolean) => {
    console.log(`Setting green in regulation to ${checked}`);
    setGreenInRegulation(checked);
    onDataChange('greenInRegulation', checked);
  }, [onDataChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="fairway">Fairway Hit</Label>
        <Switch 
          id="fairway" 
          checked={fairwayHit} 
          onCheckedChange={handleFairwayChange} 
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="gir">Green in Regulation</Label>
        <Switch 
          id="gir" 
          checked={greenInRegulation} 
          onCheckedChange={handleGreenChange} 
        />
      </div>
    </div>
  );
};
