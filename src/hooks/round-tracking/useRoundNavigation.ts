
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Simple next handler with clear logging
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    console.log(`Next button clicked. Moving from hole ${currentHole}`);
    handleNextBase();
  }, [handleNextBase, currentHole, isLoading]);
  
  // Simple previous handler with clear validation
  const handlePrev = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    if (currentHole <= 1) {
      console.log("Cannot navigate back from first hole");
      return;
    }
    
    console.log(`Previous button clicked. Moving from hole ${currentHole}`);
    handlePrevious();
  }, [handlePrevious, currentHole, isLoading]);

  return { handleNext, handlePrevious: handlePrev };
};
