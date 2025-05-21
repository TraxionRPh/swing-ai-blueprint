
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HoleNavigationProps {
  currentHole: number;
  holeCount: number;
  goToPreviousHole: () => void;
}

export const HoleNavigation = ({ 
  currentHole, 
  holeCount, 
  goToPreviousHole 
}: HoleNavigationProps) => {
  return (
    <div className="flex space-x-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPreviousHole}
        disabled={currentHole <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="bg-muted text-center px-3 py-1 rounded-md">
        {currentHole} / {holeCount}
      </div>
    </div>
  );
};
