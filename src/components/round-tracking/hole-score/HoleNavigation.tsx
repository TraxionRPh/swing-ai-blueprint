
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
  // Simple handlers that call the provided callbacks
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };
  
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrevious) onPrevious();
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
