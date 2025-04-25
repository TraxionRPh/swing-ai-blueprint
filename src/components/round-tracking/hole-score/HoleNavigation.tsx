
import { Button } from "@/components/ui/button";

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
      <Button onClick={onNext} disabled={isLast}>
        Next Hole
      </Button>
    </div>
  );
};
