import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface HoleNavigationProps {
  currentHole: number;
  holeCount: number;
  goToPreviousHole: () => void;
  goToNextHole?: () => void; // Made optional since it might not be needed in all cases
}
export const HoleNavigation = ({
  currentHole,
  holeCount,
  goToPreviousHole,
  goToNextHole
}: HoleNavigationProps) => {
  return <div className="flex items-center justify-between py-2">
      
      
      
      
      {goToNextHole && <Button variant="outline" size="sm" onClick={goToNextHole} disabled={currentHole >= holeCount}>
          Next Hole
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>}
      
      {/* If no goToNextHole is provided, add an empty div to maintain layout */}
      {!goToNextHole && <div className="w-[105px]"></div>}
    </div>;
};