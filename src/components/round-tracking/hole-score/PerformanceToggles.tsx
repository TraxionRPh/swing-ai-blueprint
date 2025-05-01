
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCallback, useState, useEffect } from "react";

interface PerformanceTogglesProps {
  fairwayHit: boolean;
  greenInRegulation: boolean;
  onFairwayToggle: (value: boolean) => void;
  onGirToggle: (value: boolean) => void;
}

export const PerformanceToggles = ({ 
  fairwayHit, 
  greenInRegulation, 
  onFairwayToggle, 
  onGirToggle
}: PerformanceTogglesProps) => {
  const [fairwayState, setFairwayState] = useState<boolean>(!!fairwayHit);
  const [girState, setGirState] = useState<boolean>(!!greenInRegulation);

  // Update local state when props change
  useEffect(() => {
    setFairwayState(!!fairwayHit);
    setGirState(!!greenInRegulation);
  }, [fairwayHit, greenInRegulation]);

  const handleFairwayChange = useCallback((checked: boolean) => {
    console.log(`Setting fairway hit to ${checked}`);
    setFairwayState(checked);
    onFairwayToggle(checked);
  }, [onFairwayToggle]);

  const handleGreenChange = useCallback((checked: boolean) => {
    console.log(`Setting green in regulation to ${checked}`);
    setGirState(checked);
    onGirToggle(checked);
  }, [onGirToggle]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="fairway">Fairway Hit</Label>
        <Switch 
          id="fairway" 
          checked={fairwayState} 
          onCheckedChange={handleFairwayChange} 
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="gir">Green in Regulation</Label>
        <Switch 
          id="gir" 
          checked={girState} 
          onCheckedChange={handleGreenChange} 
        />
      </div>
    </div>
  );
};
