
import { useCallback, useRef } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Add a click tracking ref to prevent double-clicks
  const isNavigatingRef = useRef(false);
  
  // Enhanced next handler with improved validation and direct function calling
  const handleNext = useCallback(() => {
    if (isNavigatingRef.current || isLoading) {
      console.log("Navigation blocked: already navigating or loading in progress");
      return;
    }

    // Set navigating state
    isNavigatingRef.current = true;
    
    // Add boundary validation
    if (currentHole >= (holeCount || 18)) {
      console.log(`Cannot navigate beyond last hole ${holeCount || 18}`);
      isNavigatingRef.current = false;
      return;
    }
    
    console.log(`Next button clicked. Moving from hole ${currentHole} to next hole (${currentHole + 1})`);
    
    // Call the next function directly with timeout to ensure UI updates
    if (typeof handleNextBase === 'function') {
      console.log("Calling handleNextBase function");
      // Use setTimeout to break the call stack and ensure React state updates
      setTimeout(() => {
        handleNextBase();
        // Reset navigation state after a short delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 300);
      }, 0);
    } else {
      console.error("handleNextBase is not a valid function", handleNextBase);
      isNavigatingRef.current = false;
    }
  }, [handleNextBase, currentHole, holeCount, isLoading]);
  
  // Enhanced previous handler with improved validation and direct function calling
  const handlePrev = useCallback(() => {
    if (isNavigatingRef.current || isLoading) {
      console.log("Navigation blocked: already navigating or loading in progress");
      return;
    }
    
    // Set navigating state
    isNavigatingRef.current = true;
    
    // Add boundary validation
    if (currentHole <= 1) {
      console.log("Cannot navigate back from first hole");
      isNavigatingRef.current = false;
      return;
    }
    
    console.log(`Previous button clicked. Moving from hole ${currentHole} to previous hole (${currentHole - 1})`);
    
    // Call the previous function directly with additional verification
    if (typeof handlePrevious === 'function') {
      console.log("Calling handlePrevious base function");
      // Use setTimeout to break the call stack and ensure React state updates
      setTimeout(() => {
        handlePrevious();
        // Reset navigation state after a short delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 300);
      }, 0);
    } else {
      console.error("handlePrevious is not a valid function", handlePrevious);
      isNavigatingRef.current = false;
    }
  }, [handlePrevious, currentHole, isLoading]);

  // Return both functions with consistent naming
  return { 
    handleNext, 
    handlePrevious: handlePrev 
  };
};
