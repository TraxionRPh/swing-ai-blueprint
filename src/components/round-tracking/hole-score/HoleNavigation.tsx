
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
    const path = window.location.pathname;
    
    // First check if URL explicitly defines the hole count
    const is9HolePath = /\/rounds\/new\/9($|\/)/.test(path);
    const is18HolePath = /\/rounds\/new\/18($|\/)/.test(path);
    
    if (is9HolePath) {
      console.log(`HoleNavigation: URL indicates 9-hole round`);
      setActualHoleCount(9);
    } else if (is18HolePath) {
      console.log(`HoleNavigation: URL indicates 18-hole round`);
      setActualHoleCount(18);
    } else if (storedHoleCount) {
      const parsedCount = parseInt(storedHoleCount, 10);
      setActualHoleCount(parsedCount);
      console.log(`HoleNavigation: Using hole count from session storage: ${parsedCount}`);
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

  // Simplified and more explicit logic for when to show the review button
  const shouldShowReviewButton = useCallback(() => {
    // Always get the latest value directly from session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const parsedHoleCount = storedHoleCount ? parseInt(storedHoleCount, 10) : actualHoleCount;
    
    console.log(`shouldShowReviewButton check - currentHole: ${currentHole}, holeCount: ${parsedHoleCount}, isLast: ${isLast}`);
    
    // Explicit isLast prop takes highest priority
    if (isLast === true) {
      console.log("✓ isLast prop is true - showing Review Round button");
      return true;
    }
    
    // For 9-hole rounds, show Review button ONLY on hole 9
    if (parsedHoleCount === 9 && currentHole === 9) {
      console.log("✓ 9-hole round at hole 9 - showing Review Round button");
      return true;
    }
    
    // For 18-hole rounds, show Review button ONLY on hole 18
    if (parsedHoleCount === 18 && currentHole === 18) {
      console.log("✓ 18-hole round at hole 18 - showing Review Round button");
      return true;
    }
    
    console.log(`✗ Not showing Review button - currentHole: ${currentHole}, holeCount: ${parsedHoleCount}`);
    return false;
  }, [currentHole, actualHoleCount, isLast]);

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
