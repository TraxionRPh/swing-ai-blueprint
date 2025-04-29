
import { useCallback } from "react";
import { HoleData } from "@/types/round-tracking";

export const useRoundNavigation = (
  handleNextBase: () => void,
  handlePrevious: () => void,
  currentHole: number,
  holeCount: number | null
) => {
  // Wrapper for next button that checks if we're at the last hole
  const handleNext = useCallback(() => {
    if (holeCount && currentHole === holeCount) {
      return;
    } else {
      handleNextBase();
    }
  }, [handleNextBase, currentHole, holeCount]);

  return { handleNext, handlePrevious };
};
