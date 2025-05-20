
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
  currentHole = 1,
  holeCount = 18
}: HoleNavigationProps) => {
  const [isClickingNext, setIsClickingNext] = useState(false);
  const [isClickingPrev, setIsClickingPrev] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the actual hole count from session storage on every render
  const [actualHoleCount, setActualHoleCount] = useState(holeCount);
  
  // Force update of hole count from session storage on mount and when props change
  useEffect(() => {
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    if (storedHoleCount) {
      const parsedCount = parseInt(storedHoleCount, 10);
      setActualHoleCount(parsedCount);
      console.log(`HoleNavigation: Updated actual hole count from session storage: ${parsedCount}`);
    } else {
      setActualHoleCount(holeCount);
      console.log(`HoleNavigation: Using prop hole count: ${holeCount}`);
    }
  }, [holeCount, currentHole]);

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
    // Always get the latest value directly from session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const effectiveHoleCount = storedHoleCount ? parseInt(storedHoleCount, 10) : actualHoleCount;
    
    console.log(`shouldShowReviewButton check - currentHole: ${currentHole}, effectiveHoleCount: ${effectiveHoleCount}, isLast: ${isLast}`);
    
    // If isLast is explicitly set via props, always respect that
    if (isLast === true) {
      console.log("✓ MATCH: isLast prop is true - showing Review Round button");
      return true;
    }
    
    // For 9-hole rounds, show Review button on hole 9
    if (effectiveHoleCount === 9 && currentHole === 9) {
      console.log("✓ MATCH: 9-hole round at hole 9 - showing Review Round button");
      return true;
    }
    
    // For 18-hole rounds, show Review button on hole 18
    if (effectiveHoleCount === 18 && currentHole === 18) {
      console.log("✓ MATCH: 18-hole round at hole 18 - showing Review Round button");
      return true;
    }
    
    console.log(`✗ NO MATCH: Not showing Review button - currentHole: ${currentHole}, effectiveHoleCount: ${effectiveHoleCount}`);
    return false;
  }, [currentHole, actualHoleCount, isLast]);

  console.log(`HoleNavigation rendered - Hole: ${currentHole}/${actualHoleCount}, isLast: ${isLast}, shouldShowReview: ${shouldShowReviewButton()}`);

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
