
import { useCallback, useRef } from "react";
import { useResumeSession } from "./score/use-resume-session";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null
) => {
  const { saveCurrentHole } = useResumeSession();
  const navigationInProgressRef = useRef(false);

  const handleNext = useCallback(() => {
    // Prevent rapid navigation clicks
    if (navigationInProgressRef.current) {
      console.log("Navigation in progress, ignoring click");
      return;
    }
    
    // Set navigation lock
    navigationInProgressRef.current = true;
    
    // Save the current hole to sessionStorage and localStorage for resuming later
    const holeToSave = currentHole === (holeCount || 18) ? 1 : currentHole + 1;
    saveCurrentHole(holeToSave);
    
    // Execute navigation
    handleNextBase();
    
    // Release navigation lock after a short delay
    setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
  }, [handleNextBase, currentHole, holeCount, saveCurrentHole]);

  const handlePrev = useCallback(() => {
    // Prevent rapid navigation clicks
    if (navigationInProgressRef.current) {
      console.log("Navigation in progress, ignoring click");
      return;
    }
    
    // Set navigation lock
    navigationInProgressRef.current = true;
    
    // Execute navigation
    handlePrevious();
    
    // Release navigation lock after a short delay
    setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
  }, [handlePrevious]);

  return { 
    handleNext,
    handlePrevious: handlePrev
  };
};
