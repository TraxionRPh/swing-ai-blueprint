
import { useCallback } from "react";

interface RoundNavigationProps {
  baseHandleNext: () => void;
  baseHandlePrevious: () => void;
  currentHole: number;
  holeCount: number | null;
  isLoading: boolean;
}

export const useRoundNavigation = ({
  baseHandleNext,
  baseHandlePrevious,
  currentHole,
  holeCount = 18,
  isLoading
}: RoundNavigationProps) => {
  // Handle navigation to the next hole
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Skipping navigation while loading");
      return;
    }

    if (currentHole >= (holeCount || 18)) {
      console.log("Already at the last hole");
      return;
    }
    
    console.log(`Navigating from hole ${currentHole} to next hole`);
    baseHandleNext();
  }, [currentHole, holeCount, isLoading, baseHandleNext]);
  
  // Handle navigation to the previous hole
  const handlePrevious = useCallback(() => {
    if (isLoading) {
      console.log("Skipping navigation while loading");
      return;
    }

    if (currentHole <= 1) {
      console.log("Already at the first hole");
      return;
    }
    
    console.log(`Navigating from hole ${currentHole} to previous hole`);
    baseHandlePrevious();
  }, [currentHole, isLoading, baseHandlePrevious]);
  
  // Clear resume data from session/local storage
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    console.log("Resume data cleared");
  }, []);
  
  // Flag to indicate if navigation is in progress (can be used to prevent double clicks)
  const isNavigating = false;
  
  return {
    handleNext,
    handlePrevious,
    isNavigating,
    clearResumeData
  };
};
