
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface HoleCountSelectionProps {
  holeCount: number;
  setHoleCount: (count: number) => void;
}

export const HoleCountSelection = ({ holeCount, setHoleCount }: HoleCountSelectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);

  // Set initial value based on URL if present, but only on first render
  useEffect(() => {
    if (initialLoad) {
      // Check if URL contains hole count information
      if (location.pathname.includes('/9')) {
        setHoleCount(9);
      } else if (location.pathname.includes('/18')) {
        setHoleCount(18);
      }
      setInitialLoad(false);
    }
  }, [location.pathname, setHoleCount, initialLoad]);

  const handleHoleCountChange = (value: string) => {
    const newHoleCount = parseInt(value);
    setHoleCount(newHoleCount);
    
    // Update URL without forcing navigation/reload
    // Use history.replaceState to avoid full page reload
    const baseUrl = "/rounds/new";
    const newUrl = value === "9" ? `${baseUrl}/9` : `${baseUrl}/18`;
    
    // Only update URL, don't navigate (which would cause a reload)
    window.history.replaceState(null, '', newUrl);
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Round Type</h3>
      <RadioGroup 
        value={holeCount.toString()} 
        className="grid grid-cols-2 gap-4"
        onValueChange={handleHoleCountChange}
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
