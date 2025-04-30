
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null,
  isLoading: boolean = false
) => {
  // Simple next handler with basic validation
  const handleNext = useCallback(() => {
    if (isLoading) {
      console.log("Navigation blocked: loading in progress");
      return;
    }
    
    console.log(`Navigating from hole ${currentHole}`);
    handleNextBase();
  }, [handleNextBase, currentHole, isLoading]);
  
  // Simple previous handler with basic validation
  const handlePrev = useCallback(() => {
    if (isLoading || currentHole <= 1) {
      console.log("Navigation blocked: loading or at first hole");
      return;
    }
    
    console.log(`Navigating to previous hole from ${currentHole}`);
    handlePrevious();
  }, [handlePrevious, currentHole, isLoading]);

  return { handleNext, handlePrevious: handlePrev };
};
