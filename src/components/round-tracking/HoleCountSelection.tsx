
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface HoleCountSelectionProps {
  holeCount: number;
  setHoleCount: (count: number) => void;
}

export const HoleCountSelection = ({ holeCount, setHoleCount }: HoleCountSelectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Round Type</h3>
      <RadioGroup 
        defaultValue={holeCount.toString()} 
        className="grid grid-cols-2 gap-4"
        onValueChange={(value) => {
          const newHoleCount = parseInt(value);
          setHoleCount(newHoleCount);
          
          // Update URL to reflect hole count
          const baseUrl = "/rounds/new";
          if (value === "9") {
            navigate(`${baseUrl}/9`, { replace: true });
          } else if (value === "18") {
            navigate(`${baseUrl}/18`, { replace: true });
          } else {
            navigate(baseUrl, { replace: true });
          }
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
