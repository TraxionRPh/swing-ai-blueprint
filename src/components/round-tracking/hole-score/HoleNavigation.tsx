
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
  const [currentHoleCount, setCurrentHoleCount] = useState(holeCount);
  
  // Force update of hole count from session storage on every render
  useEffect(() => {
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const parsedCount = storedHoleCount ? parseInt(storedHoleCount, 10) : holeCount;
    setCurrentHoleCount(parsedCount);
    
    console.log(`HoleNavigation refreshed hole count: ${parsedCount} (from props: ${holeCount})`);
    console.log(`Current hole: ${currentHole}, Is last hole? ${isLast}`);
  }, [holeCount, currentHole, isLast]);

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
    // Get latest hole count from session storage for most accurate check
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const actualHoleCount = storedHoleCount ? parseInt(storedHoleCount, 10) : currentHoleCount;
    
    console.log(`shouldShowReviewButton check - currentHole: ${currentHole}, actualHoleCount: ${actualHoleCount}`);
    
    // For 9-hole rounds, show the Review button on hole 9
    if (actualHoleCount === 9 && currentHole === 9) {
      console.log("✓ MATCH: 9-hole round at hole 9 - showing Review Round button");
      return true;
    }
    
    // For 18-hole rounds, show the Review button on hole 18
    if (actualHoleCount === 18 && currentHole === 18) {
      console.log("✓ MATCH: 18-hole round at hole 18 - showing Review Round button");
      return true;
    }
    
    // If explicitly marked as the last hole, show the Review button
    if (isLast === true) {
      console.log("✓ MATCH: isLast prop is true - showing Review Round button");
      return true;
    }
    
    // If current hole equals the hole count, show the Review button as well
    if (currentHole === actualHoleCount) {
      console.log(`✓ MATCH: Current hole (${currentHole}) equals hole count (${actualHoleCount}) - showing Review Round button`);
      return true;
    }
    
    console.log(`✗ NO MATCH: Not showing Review button - currentHole: ${currentHole}, holeCount: ${actualHoleCount}, isLast: ${isLast}`);
    return false;
  }, [currentHole, currentHoleCount, isLast]);

  console.log(`HoleNavigation rendered - Hole: ${currentHole}/${currentHoleCount}, isLast: ${isLast}, shouldShowReview: ${shouldShowReviewButton()}`);

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
