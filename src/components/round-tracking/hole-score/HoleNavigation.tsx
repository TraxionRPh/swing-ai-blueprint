
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
  
  // Track URL for direct detection of 9-hole rounds
  const urlPathRef = useRef(window.location.pathname);
  
  // Synchronize with session storage and props on mount and when they change
  useEffect(() => {
    // Update URL path reference
    urlPathRef.current = window.location.pathname;
    
    // Get count from session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const parsedCount = storedHoleCount ? parseInt(storedHoleCount, 10) : null;
    
    // Direct URL detection as the most reliable source of truth
    const path = window.location.pathname;
    let urlDetectedCount: number | null = null;
    
    // Handle direct URL patterns for hole count
    if (path.includes('/rounds/new/9') || path.endsWith('/9')) {
      urlDetectedCount = 9;
      console.log("HoleNavigation: Direct URL detection found 9-hole round");
    } else if (path.includes('/rounds/new/18') || path.endsWith('/18')) {
      urlDetectedCount = 18;
      console.log("HoleNavigation: Direct URL detection found 18-hole round");
    }
    
    // Determine the hole count with clear priority:
    // 1. URL direct detection (highest priority)
    // 2. Session storage if valid
    // 3. Fall back to props
    
    let finalHoleCount = holeCount;
    
    if (urlDetectedCount === 9 || urlDetectedCount === 18) {
      finalHoleCount = urlDetectedCount;
      console.log(`HoleNavigation: Using hole count from URL: ${finalHoleCount}`);
      
      // Also update session storage to match URL (highest source of truth)
      if (storedHoleCount !== finalHoleCount.toString()) {
        console.log(`HoleNavigation: Updating session storage to match URL: ${finalHoleCount}`);
        sessionStorage.setItem('current-hole-count', finalHoleCount.toString());
      }
    } 
    // Only use session storage if it contains a valid value and no URL detection
    else if ((parsedCount === 9 || parsedCount === 18) && !urlDetectedCount) {
      finalHoleCount = parsedCount;
      console.log(`HoleNavigation: Using hole count from session storage: ${finalHoleCount}`);
    } else {
      console.log(`HoleNavigation: Using prop hole count: ${finalHoleCount}`);
    }
    
    // Set the effective hole count
    setEffectiveHoleCount(finalHoleCount);
    
    // Determine if this is the last hole - explicitly set isLast prop takes highest priority
    const finalIsLast = isLast === true || (currentHole === finalHoleCount);
    setEffectiveIsLast(finalIsLast);
    
    console.log(`HoleNavigation: Current hole ${currentHole}/${finalHoleCount}, isLast: ${finalIsLast}`);
    
  }, [holeCount, currentHole, isLast, window.location.pathname]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Simplified "show review button" logic with direct path inspection as a safeguard
  const shouldShowReviewButton = useCallback(() => {
    // First, check the explicit isLast prop (highest priority)
    if (isLast === true) {
      console.log("✓ Showing review button - isLast prop is explicitly set to true");
      return true;
    }
    
    // Next, check if we're at the last hole based on currentHole and effectiveHoleCount
    const isAtLastHole = currentHole === effectiveHoleCount;
    
    // Add URL path inspection as a final safety check for 9-hole rounds
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    
    // Special handling for 9-hole rounds at hole 9
    if (is9HoleRound && currentHole === 9) {
      console.log("✓ Showing review button - we're at hole 9 in a 9-hole round (URL verified)");
      return true;
    }
    
    // Standard check if we're at the last hole
    if (isAtLastHole) {
      console.log(`✓ Showing review button - we're at the last hole (${currentHole}/${effectiveHoleCount})`);
      return true;
    }
    
    console.log(`✗ Not showing review button - not at last hole (${currentHole}/${effectiveHoleCount})`);
    return false;
  }, [currentHole, effectiveHoleCount, effectiveIsLast, isLast]);

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

  // Next button handler with improved review button logic
  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClickingNext || isClickingPrev) {
      return;
    }
    setIsClickingNext(true);
    console.log("Next button clicked");
    
    // Get real-time determination if we should show review
    const showReview = shouldShowReviewButton();
    console.log(`Should show review: ${showReview}`);
    
    // Add URL inspection as a final safety check for 9-hole rounds
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    const forceShowReview = is9HoleRound && currentHole === 9;
    
    if ((showReview || forceShowReview) && onReviewRound) {
      console.log("Showing round review");
      onReviewRound();
    } else if (typeof onNext === 'function') {
      console.log("Navigating to next hole");
      onNext();
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setIsClickingNext(false);
    }, 500);
  }, [onNext, onReviewRound, shouldShowReviewButton, isClickingNext, isClickingPrev, currentHole]);

  // Final safety check: force review button if we're at hole 9 in a 9-hole round
  const path = window.location.pathname;
  const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
  const forceShowReview = is9HoleRound && currentHole === 9;
  
  // Combined logic for showing the review button
  const showReviewButton = shouldShowReviewButton() || forceShowReview;
  
  if (forceShowReview) {
    console.log("Force showing review button because we're at hole 9 in a 9-hole round");
  }

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
        variant={showReviewButton ? "review" : "default"}
      >
        {showReviewButton ? (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Review Round
          </>
        ) : "Next Hole"}
      </Button>
    </div>
  );
};
