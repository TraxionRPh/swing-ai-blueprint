
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
    
    // Ensure the base function is called directly without any additional wrapper
    handleNextBase();
  }, [handleNextBase, currentHole, isLoading]);
  
  // Enhanced previous handler with better validation
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
    
    // Call the base function directly
    handlePrevious();
  }, [handlePrevious, currentHole, isLoading]);

  // Return both functions with clear naming
  return { 
    handleNext, 
    handlePrevious: handlePrev 
  };
};
