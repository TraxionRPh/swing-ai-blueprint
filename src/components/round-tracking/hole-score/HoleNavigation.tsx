
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
  // Fixed previous button handler - use direct function call
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    console.log("Previous button clicked in HoleNavigation component");
    
    if (onPrevious) {
      console.log("Calling onPrevious handler from parent");
      onPrevious();
    } else {
      console.warn("Previous handler is not defined");
    }
  };
  
  // Fixed next button handler - use direct function call
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
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
        className="w-[140px]" // Fixed width to prevent jumpy layout
      >
        Previous Hole
      </Button>
      <Button 
        onClick={handleNext} 
        disabled={isLast && !onNext}
        className={`${isLast ? "bg-primary hover:bg-primary/90" : ""} w-[140px]`} // Fixed width
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
