
import { Button } from "@/components/ui/button";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

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
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrevious} 
        disabled={isFirst}
        className="focus:ring-2 focus:ring-primary"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous Hole
      </Button>
      <Button 
        onClick={onNext} 
        disabled={false} // Never disable next button to allow review
        className="focus:ring-2 focus:ring-primary"
      >
        {isLast ? (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Round
          </>
        ) : (
          <>
            Next Hole
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
