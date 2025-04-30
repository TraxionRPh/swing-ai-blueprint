
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

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
  // Enhanced previous button click handler with more detailed logging
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Previous button clicked in HoleNavigation component");
    
    if (onPrevious) {
      console.log("Calling onPrevious handler from parent");
      onPrevious();
    } else {
      console.warn("Previous handler is not defined");
    }
  };
  
  // Enhanced next button handler with better logging
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Next button clicked in HoleNavigation component");
    
    if (onNext) {
      console.log("Calling onNext handler from parent");
      onNext();
    } else {
      console.warn("Next handler is not defined");
    }
  };

  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={isFirst}
        type="button"
      >
        Previous Hole
      </Button>
      <Button 
        onClick={handleNext} 
        disabled={isLast && !onNext}
        className={isLast ? "bg-primary hover:bg-primary/90" : ""}
        type="button"
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
