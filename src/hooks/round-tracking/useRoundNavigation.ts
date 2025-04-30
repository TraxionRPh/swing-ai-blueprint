
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Prevent navigation during loading to avoid race conditions
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    if (holeCount && currentHole === holeCount) {
      console.log("Navigation: at last hole, showing review");
      // Don't block navigation at last hole - let the caller handle showing review
      handleNextBase();
    } else {
      console.log(`Navigating to next hole from ${currentHole}`);
      handleNextBase();
    }
  }, [handleNextBase, currentHole, holeCount, isLoading]);
  
  const handlePrev = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    if (currentHole <= 1) {
      console.log("Navigation blocked: already at first hole");
      return;
    } else {
      console.log(`Navigating to previous hole from ${currentHole}`);
      handlePrevious();
    }
  }, [handlePrevious, currentHole, isLoading]);

  return { handleNext, handlePrevious: handlePrev };
};
