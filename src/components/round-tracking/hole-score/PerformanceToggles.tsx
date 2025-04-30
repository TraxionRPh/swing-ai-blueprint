
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { HoleData } from "@/types/round-tracking";
import { useCallback } from "react";

interface PerformanceTogglesProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: boolean) => void;
}

export const PerformanceToggles = ({ data, onDataChange }: PerformanceTogglesProps) => {
  const handleFairwayChange = useCallback((checked: boolean) => {
    onDataChange('fairwayHit', checked);
  }, [onDataChange]);

  const handleGreenChange = useCallback((checked: boolean) => {
    onDataChange('greenInRegulation', checked);
  }, [onDataChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="fairway">Fairway Hit</Label>
        <Switch 
          id="fairway" 
          checked={data.fairwayHit} 
          onCheckedChange={handleFairwayChange} 
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="gir">Green in Regulation</Label>
        <Switch 
          id="gir" 
          checked={data.greenInRegulation} 
          onCheckedChange={handleGreenChange} 
        />
      </div>
    </div>
  );
};
