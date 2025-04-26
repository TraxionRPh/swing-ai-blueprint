
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FocusAreaSelectorProps {
  focus: string;
  onChange: (value: string) => void;
}

export const FocusAreaSelector = ({ focus, onChange }: FocusAreaSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Focus Areas</h3>
      <RadioGroup value={focus} onValueChange={onChange}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balanced" id="focus-balanced" />
            <Label htmlFor="focus-balanced">Balanced Practice</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="driving" id="focus-driving" />
            <Label htmlFor="focus-driving">Driving Improvement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="iron-play" id="focus-iron" />
            <Label htmlFor="focus-iron">Iron Play</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="short-game" id="focus-short" />
            <Label htmlFor="focus-short">Short Game</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="putting" id="focus-putting" />
            <Label htmlFor="focus-putting">Putting</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weaknesses" id="focus-weaknesses" />
            <Label htmlFor="focus-weaknesses">Target Weaknesses</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};
