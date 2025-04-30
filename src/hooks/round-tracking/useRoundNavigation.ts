
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Enhanced next handler with improved validation and direct function calling
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    // Add boundary validation
    if (currentHole >= (holeCount || 18)) {
      console.log(`Cannot navigate beyond last hole ${holeCount || 18}`);
      return;
    }
    
    console.log(`Next button clicked. Moving from hole ${currentHole} to next hole`);
    
    // Call the next function directly
    if (typeof handleNextBase === 'function') {
      console.log("Calling handleNextBase function");
      handleNextBase();
    } else {
      console.error("handleNextBase is not a valid function", handleNextBase);
    }
  }, [handleNextBase, currentHole, holeCount, isLoading]);
  
  // Enhanced previous handler with improved validation and direct function calling
  const handlePrev = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    // Add boundary validation
    if (currentHole <= 1) {
      console.log("Cannot navigate back from first hole");
      return;
    }
    
    console.log(`Previous button clicked. Moving from hole ${currentHole} to previous hole`);
    
    // Call the previous function directly with additional verification
    if (typeof handlePrevious === 'function') {
      console.log("Calling handlePrevious base function");
      handlePrevious();
    } else {
      console.error("handlePrevious is not a valid function", handlePrevious);
    }
  }, [handlePrevious, currentHole, isLoading]);

  // Return both functions with consistent naming
  return { 
    handleNext, 
    handlePrevious: handlePrev 
  };
};
