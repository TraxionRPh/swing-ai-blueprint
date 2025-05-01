
import { useState, useCallback } from "react";
import { useRoundData } from "./useRoundData";
import { useRoundNavigation } from "./useRoundNavigation";
import type { HoleData } from "@/types/round-tracking";

export const useRoundContext = (roundId: string | null, courseId?: string) => {
  const [holeCount, setHoleCount] = useState<number>(18);
  
  // Initialize round data
  const {
    holeScores,
    setHoleScores,
    courseData,
    isLoading: isDataLoading,
    isSaving,
    saveHoleScore,
    handleHoleUpdate,
    fetchHoleScoresFromRound
  } = useRoundData(roundId, courseId);
  
  // Handle hole navigation with callback for auto-saving
  const handleHoleChange = useCallback((newHole: number) => {
    console.log(`Hole changed to ${newHole}`);
  }, []);
  
  const {
    currentHole,
    setCurrentHole,
    handleNext: baseHandleNext,
    handlePrevious: baseHandlePrevious,
    isNavigating,
    clearResumeData
  } = useRoundNavigation({
    holeCount,
    onHoleChange: handleHoleChange
  });
  
  // Get the current hole data
  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  };
  
  // Enhanced navigation with auto-saving
  const handleNext = useCallback(async () => {
    if (isNavigating || isSaving) return;
    
    try {
      // Save the current hole data before navigating
      if (roundId) {
        await saveHoleScore(currentHoleData);
      }
    } catch (error) {
      console.error("Failed to save hole data before navigation:", error);
    }
    
    // Navigate to next hole
    baseHandleNext();
  }, [roundId, currentHoleData, saveHoleScore, baseHandleNext, isNavigating, isSaving]);
  
  const handlePrevious = useCallback(async () => {
    if (isNavigating || isSaving) return;
    
    try {
      // Save the current hole data before navigating
      if (roundId) {
        await saveHoleScore(currentHoleData);
      }
    } catch (error) {
      console.error("Failed to save hole data before navigation:", error);
    }
    
    // Navigate to previous hole
    baseHandlePrevious();
  }, [roundId, currentHoleData, saveHoleScore, baseHandlePrevious, isNavigating, isSaving]);
  
  return {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    currentHoleData,
    courseData,
    isLoading: isDataLoading || isNavigating,
    isSaving,
    holeCount,
    setHoleCount,
    clearResumeData,
    fetchHoleScoresFromRound
  };
};
