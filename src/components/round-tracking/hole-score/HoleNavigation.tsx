
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

  // Read hole count from session storage once on mount
  const [effectiveHoleCount, setEffectiveHoleCount] = useState(holeCount);
  const [effectiveIsLast, setEffectiveIsLast] = useState(isLast || false);
  
  // Synchronize with session storage and props on mount and when they change
  useEffect(() => {
    // Get count from session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const parsedCount = storedHoleCount ? parseInt(storedHoleCount, 10) : null;
    
    // Determine the hole count with clear priority:
    // 1. Use explicit isLast prop if provided (highest priority)
    // 2. Use session storage if valid
    // 3. Fall back to props
    
    let finalHoleCount = holeCount;
    
    // Only use session storage if it contains a valid value
    if (parsedCount === 9 || parsedCount === 18) {
      finalHoleCount = parsedCount;
      console.log(`HoleNavigation: Using hole count from session storage: ${finalHoleCount}`);
    } else {
      console.log(`HoleNavigation: Using prop hole count: ${finalHoleCount}`);
    }
    
    // Set the effective hole count
    setEffectiveHoleCount(finalHoleCount);
    
    // Determine if this is the last hole
    // isLast prop explicitly set takes highest priority
    const finalIsLast = isLast === true || (currentHole === finalHoleCount);
    setEffectiveIsLast(finalIsLast);
    
    console.log(`HoleNavigation: Current hole ${currentHole}/${finalHoleCount}, isLast: ${finalIsLast}`);
    
  }, [holeCount, currentHole, isLast]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Simplified "show review button" logic
  const shouldShowReviewButton = useCallback(() => {
    // Check if we're at the last hole
    console.log(`shouldShowReviewButton check - currentHole: ${currentHole}, effectiveHoleCount: ${effectiveHoleCount}, effectiveIsLast: ${effectiveIsLast}`);
    
    if (effectiveIsLast) {
      console.log("✓ Showing review button - we're at the last hole");
      return true;
    }
    
    console.log(`✗ Not showing review button - not at last hole`);
    return false;
  }, [currentHole, effectiveHoleCount, effectiveIsLast]);

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
      <Button 
        variant="outline" 
        onClick={handlePrevious} 
        disabled={isFirst || isClickingPrev || isClickingNext} 
        type="button" 
        className="w-[140px]" 
        data-testid="previous-hole-button"
      >
        Previous Hole
      </Button>
      
      <Button 
        onClick={handleNext} 
        disabled={isClickingNext || isClickingPrev} 
        className="w-[140px]" 
        type="button" 
        data-testid="next-hole-button"
        variant={shouldShowReviewButton() ? "review" : "default"}
      >
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
