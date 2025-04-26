
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PlanDurationSelectorProps {
  duration: string;
  onChange: (value: string) => void;
}

export const PlanDurationSelector = ({ duration, onChange }: PlanDurationSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Plan Duration</h3>
      <RadioGroup value={duration} onValueChange={onChange} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1" id="day-1" />
          <Label htmlFor="day-1">1 Day</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="3" id="day-3" />
          <Label htmlFor="day-3">3 Days</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="5" id="day-5" />
          <Label htmlFor="day-5">5 Days</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
