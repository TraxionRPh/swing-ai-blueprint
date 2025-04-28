
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Course } from "@/types/round-tracking";

interface HoleCountSelectorProps {
  selectedCourse: Course;
  onHoleCountSelect: (count: number) => void;
}

export const HoleCountSelector = ({ selectedCourse, onHoleCountSelect }: HoleCountSelectorProps) => {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4">How many holes are you playing?</h3>
      <RadioGroup 
        defaultValue="18" 
        className="grid grid-cols-2 gap-4"
        onValueChange={(value) => {
          const count = parseInt(value);
          onHoleCountSelect(count);
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="9" id="nine" />
          <Label htmlFor="nine">9 Holes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="18" id="eighteen" />
          <Label htmlFor="eighteen">18 Holes</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
