
import { useCallback } from "react";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null
) => {
  const handleNext = useCallback(() => {
    // Save the current hole to sessionStorage and localStorage for resuming later
    // This helps if the app is refreshed or closed accidentally
    const holeToSave = currentHole === (holeCount || 18) ? 1 : currentHole + 1;
    sessionStorage.setItem('resume-hole-number', holeToSave.toString());
    localStorage.setItem('resume-hole-number', holeToSave.toString());
    
    handleNextBase();
  }, [handleNextBase, currentHole, holeCount]);

  return { handleNext };
};
