
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
  return (
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
        Previous Hole
      </Button>
      <Button 
        onClick={onNext} 
        disabled={isLast}
        className={isLast ? "bg-primary hover:bg-primary/90" : ""}
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

