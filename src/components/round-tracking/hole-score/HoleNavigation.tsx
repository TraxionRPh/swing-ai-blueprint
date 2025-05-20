
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

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Explicit check for when to show review button - simplified to be very direct
  const shouldShowReviewButton = useCallback(() => {
    // For 9-hole rounds, show the Review button on hole 9
    if (holeCount === 9 && currentHole === 9) {
      console.log("On hole 9 of a 9-hole round, showing Review Round button");
      return true;
    }
    
    // For 18-hole rounds, show the Review button on hole 18
    if (holeCount === 18 && currentHole === 18) {
      console.log("On hole 18 of an 18-hole round, showing Review Round button");
      return true;
    }
    
    // If explicitly marked as the last hole, show the Review button
    if (isLast === true) {
      console.log("isLast prop is true, showing Review Round button");
      return true;
    }
    
    console.log(`Not showing Review Round button: hole ${currentHole} of ${holeCount}`);
    return false;
  }, [currentHole, holeCount, isLast]);

  console.log(`HoleNavigation rendered - Hole: ${currentHole}/${holeCount}, isLast: ${isLast}, shouldShowReview: ${shouldShowReviewButton()}`);

  // Previous button handler with debounce
  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClickingPrev || isClickingNext) {
      return;
    }
    setIsClickingPrev(true);
    console.log("Previous button clicked");
    if (typeof onPrevious === 'function') {
      onPrevious();
      clickTimeoutRef.current = setTimeout(() => {
        setIsClickingPrev(false);
      }, 500);
    } else {
      setIsClickingPrev(false);
    }
  }, [onPrevious, isClickingPrev, isClickingNext]);

  // Next button handler with debounce
  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClickingNext || isClickingPrev) {
      return;
    }
    setIsClickingNext(true);
    console.log("Next button clicked");
    
    const showReview = shouldShowReviewButton();
    console.log(`Should show review: ${showReview}`);
    
    if (showReview && onReviewRound) {
      console.log("Showing round review");
      onReviewRound();
    } else if (typeof onNext === 'function') {
      console.log("Navigating to next hole");
      onNext();
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setIsClickingNext(false);
    }, 500);
  }, [onNext, onReviewRound, shouldShowReviewButton, isClickingNext, isClickingPrev]);

  return (
    <div className="flex justify-between items-center mt-6">
      <Button variant="outline" onClick={handlePrevious} disabled={isFirst || isClickingPrev || isClickingNext} type="button" className="w-[140px]" data-testid="previous-hole-button">
        Previous Hole
      </Button>
      
      <Button onClick={handleNext} disabled={isClickingNext || isClickingPrev} className="w-[140px]" type="button" data-testid="next-hole-button">
        {shouldShowReviewButton() ? (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Round
          </>
        ) : "Next Hole"}
      </Button>
    </div>
  );
};
