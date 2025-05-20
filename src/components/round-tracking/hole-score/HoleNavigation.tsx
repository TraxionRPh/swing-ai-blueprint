
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

interface HoleNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onReviewRound?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  currentHole?: number;
  holeCount?: number;
}

export const HoleNavigation = ({
  onNext,
  onPrevious,
  onReviewRound,
  isFirst,
  isLast,
  currentHole,
  holeCount = 18
}: HoleNavigationProps) => {
  const [isClickingNext, setIsClickingNext] = useState(false);
  const [isClickingPrev, setIsClickingPrev] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine if the current hole should show the review button
  // For 9-hole rounds, show on hole 9; for 18-hole rounds, show on hole 18
  const showReviewButton = currentHole === holeCount;

  console.log(`HoleNavigation: currentHole=${currentHole}, holeCount=${holeCount}, showReviewButton=${showReviewButton}`);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced previous button handler with debounce
  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClickingPrev || isClickingNext) {
      console.log("Navigation blocked: already processing a click");
      return;
    }
    setIsClickingPrev(true);
    console.log("Previous button clicked");
    if (typeof onPrevious === 'function') {
      // Call the handler directly
      onPrevious();

      // Reset clicking state after a delay
      clickTimeoutRef.current = setTimeout(() => {
        setIsClickingPrev(false);
      }, 500);
    } else {
      console.warn("Previous handler is not defined");
      setIsClickingPrev(false);
    }
  }, [onPrevious, isClickingPrev, isClickingNext]);

  // Enhanced next button handler with debounce
  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClickingNext || isClickingPrev) {
      console.log("Navigation blocked: already processing a click");
      return;
    }
    setIsClickingNext(true);
    console.log("Next button clicked");
    
    // Special handling for review round button
    if (showReviewButton && onReviewRound) {
      console.log("Showing round review");
      onReviewRound();
      
      // Reset clicking state after a delay
      clickTimeoutRef.current = setTimeout(() => {
        setIsClickingNext(false);
      }, 500);
      return;
    }
    
    if (typeof onNext === 'function') {
      // Call the handler directly
      onNext();

      // Reset clicking state after a delay
      clickTimeoutRef.current = setTimeout(() => {
        setIsClickingNext(false);
      }, 500);
    } else {
      console.warn("Next handler is not defined");
      setIsClickingNext(false);
    }
  }, [onNext, onReviewRound, showReviewButton, isClickingNext, isClickingPrev]);

  return <div className="flex justify-between items-center mt-6">
      <Button variant="outline" onClick={handlePrevious} disabled={isFirst || isClickingPrev || isClickingNext} type="button" className="w-[140px]" data-testid="previous-hole-button">
        Previous Hole
      </Button>
      
      <Button onClick={handleNext} disabled={isClickingNext || isClickingPrev} className="w-[140px]" type="button" data-testid="next-hole-button">
        {showReviewButton ? <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Round
          </> : "Next Hole"}
      </Button>
    </div>;
};
