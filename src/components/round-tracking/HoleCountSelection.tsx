
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-native";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRound } from "@/context/round";

interface HoleCountSelectionProps {
  holeCount: number;
  setHoleCount: (count: number) => void;
}

export const HoleCountSelection = ({ holeCount, setHoleCount }: HoleCountSelectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);
  const roundContext = useRound();
  
  // Set initial value based on URL if present, but only on first render
  useEffect(() => {
    if (initialLoad) {
      // Check if URL contains hole count information
      if (location.pathname.includes('/9')) {
        setHoleCount(9);
        // Also update in round context if available
        if (roundContext?.setHoleCount) {
          roundContext.setHoleCount(9);
        }
        console.log("Setting hole count to 9 from URL path");
      } else if (location.pathname.includes('/18')) {
        setHoleCount(18);
        // Also update in round context if available
        if (roundContext?.setHoleCount) {
          roundContext.setHoleCount(18);
        }
        console.log("Setting hole count to 18 from URL path");
      }
      setInitialLoad(false);
    }
  }, [location.pathname, setHoleCount, initialLoad, roundContext]);

  const handleHoleCountChange = (value: string) => {
    const newHoleCount = parseInt(value);
    setHoleCount(newHoleCount);
    
    // Also update in round context if available
    if (roundContext?.setHoleCount) {
      roundContext.setHoleCount(newHoleCount);
    }
    
    console.log("Hole count changed to:", newHoleCount);
    
    // Update URL without navigation
    const currentPath = location.pathname;
    
    // Determine the base path and construct new URL
    let newUrl;
    if (currentPath.includes('/rounds/new')) {
      // If we're already on the rounds/new path, just update the hole count
      newUrl = value === "9" ? `/rounds/new/9` : `/rounds/new/18`;
    } else {
      // Default fallback
      newUrl = value === "9" ? `/rounds/new/9` : `/rounds/new/18`;
    }
    
    // Update URL without triggering full navigation
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
