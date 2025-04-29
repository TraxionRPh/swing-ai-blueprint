
import { useCallback } from "react";
import { useResumeSession } from "./score/use-resume-session";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null
) => {
  const { saveCurrentHole } = useResumeSession();
  
  const handleNext = useCallback(() => {
    // Save the current hole to sessionStorage and localStorage for resuming later
    // This helps if the app is refreshed or closed accidentally
    const holeToSave = currentHole === (holeCount || 18) ? 1 : currentHole + 1;
    saveCurrentHole(holeToSave);
    
    handleNextBase();
  }, [handleNextBase, currentHole, holeCount, saveCurrentHole]);

  return { handleNext };
};
