
import { useState, useCallback } from "react";
import { useRoundData } from "./useRoundData";
import { useRoundNavigation } from "./useRoundNavigation";
import type { HoleData } from "@/types/round-tracking";

export const useRoundContext = (roundId: string | null, courseId?: string) => {
  const [holeCount, setHoleCount] = useState<number>(18);
  const [currentHole, setCurrentHole] = useState<number>(1);
  
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
  
  // Handle hole change callback
  const handleHoleChange = useCallback((newHole: number) => {
    console.log(`Hole changed to ${newHole}`);
    setCurrentHole(newHole);
  }, []);
  
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
  
  // Define base navigation functions
  const baseHandleNext = useCallback(() => {
    if (currentHole < holeCount) {
      setCurrentHole(currentHole + 1);
    }
  }, [currentHole, holeCount]);
  
  const baseHandlePrevious = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1);
    }
  }, [currentHole]);
  
  // Use the navigation hook with our base functions
  const {
    handleNext,
    handlePrevious,
    isNavigating,
    clearResumeData
  } = useRoundNavigation({
    baseHandleNext,
    baseHandlePrevious,
    currentHole,
    holeCount,
    isLoading: isDataLoading || isSaving
  });
  
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
