
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Enhanced next handler with better logging and debugging
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    console.log(`Next button clicked. Moving from hole ${currentHole} to next hole`);
    handleNextBase();
  }, [handleNextBase, currentHole, isLoading]);
  
  // Fixed previous handler - directly call the provided function
  const handlePrev = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    if (currentHole <= 1) {
      console.log("Cannot navigate back from first hole");
      return;
    }
    
    console.log(`Previous button clicked. Moving from hole ${currentHole} to previous hole`);
    console.log("Calling handlePrevious base function");
    handlePrevious();
  }, [handlePrevious, currentHole, isLoading]);

  // Return both functions with consistent naming
  return { 
    handleNext, 
    handlePrevious: handlePrev 
  };
};
