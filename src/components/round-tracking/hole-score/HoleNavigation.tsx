
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";

interface HoleNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const HoleNavigation = ({
  onNext,
  onPrevious,
  isFirst,
  isLast
}: HoleNavigationProps) => {
  // Add state to track button clicks and prevent rapid multiple clicks
  const [isClicking, setIsClicking] = useState(false);
  
  // Clear clicking state if component unmounts while in clicking state
  useEffect(() => {
    return () => setIsClicking(false);
  }, []);
  
  // Enhanced previous button handler with debounce protection
  const handlePrevious = (e: React.MouseEvent) => {
    // Prevent default browser behavior and stop event propagation
    e.preventDefault();
    e.stopPropagation();
    
    if (isClicking) {
      console.log("Click blocked: already processing a click");
      return;
    }
    
    setIsClicking(true);
    console.log("Previous button clicked in HoleNavigation component");
    
    if (typeof onPrevious === 'function') {
      console.log("Calling onPrevious handler from parent");
      
      try {
        // Call the handler directly to avoid any React event system issues
        onPrevious();
      } catch (err) {
        console.error("Error in previous button handler:", err);
      }
      
      // Reset clicking state after a short delay to prevent rapid clicks
      setTimeout(() => {
        setIsClicking(false);
      }, 300);
    } else {
      console.warn("Previous handler is not defined or not a function");
      setIsClicking(false);
    }
  };
  
  // Enhanced next button handler with debounce protection
  const handleNext = (e: React.MouseEvent) => {
    // Prevent default browser behavior and stop event propagation
    e.preventDefault();
    e.stopPropagation();
    
    if (isClicking) {
      console.log("Click blocked: already processing a click");
      return;
    }
    
    setIsClicking(true);
    console.log("Next button clicked in HoleNavigation component");
    
    if (typeof onNext === 'function') {
      console.log("Calling onNext handler from parent");
      
      try {
        // Call the handler directly to avoid any React event system issues
        onNext();
      } catch (err) {
        console.error("Error in next button handler:", err);
      }
      
      // Reset clicking state after a short delay to prevent rapid clicks
      setTimeout(() => {
        setIsClicking(false);
      }, 300);
    } else {
      console.warn("Next handler is not defined or not a function");
      setIsClicking(false);
    }
  };

  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={isFirst || isClicking}
        type="button"
        className="w-[140px]"
        data-testid="previous-hole-button"
      >
        Previous Hole
      </Button>
      <Button 
        onClick={handleNext} 
        disabled={(isLast && !onNext) || isClicking}
        className={`${isLast ? "bg-primary hover:bg-primary/90" : ""} w-[140px]`}
        type="button"
        data-testid="next-hole-button"
      >
        {isLast ? (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Round
          </>
        ) : (
          "Next Hole"
        )}
      </Button>
    </div>
  );
};
