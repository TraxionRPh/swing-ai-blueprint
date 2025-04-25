
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { HoleData } from "@/types/round-tracking";

interface PerformanceTogglesProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: boolean) => void;
}

export const PerformanceToggles = ({ data, onDataChange }: PerformanceTogglesProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="fairway">Fairway Hit</Label>
        <Switch 
          id="fairway" 
          checked={data.fairwayHit} 
          onCheckedChange={checked => onDataChange('fairwayHit', checked)} 
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="gir">Green in Regulation</Label>
        <Switch 
          id="gir" 
          checked={data.greenInRegulation} 
          onCheckedChange={checked => onDataChange('greenInRegulation', checked)} 
        />
      </div>
    </div>
  );
};
