
import { useCallback } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useRoundContext } from "../useRoundContext";

export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  // Use the unified round context
  const roundContext = useRoundContext(roundId, courseId);
  
  // Map the round context values to the expected interface
  const {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious,
    handleHoleUpdate,
    currentHoleData,
    isSaving,
    clearResumeData
  } = roundContext;
  
  return {
    currentHole,
    setCurrentHole,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData
  };
};
