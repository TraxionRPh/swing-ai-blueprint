
import { useState, useCallback, useMemo } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHolePersistence } from "./score/use-hole-persistence";

export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  
  // Create memoized current hole data
  const currentHoleData = useMemo(() => {
    // First try to find the exact hole in the scores array
    const exactHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (exactHole) return exactHole;
    
    // If not found, create default data for the current hole
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [holeScores, currentHole]);

  // Handle updating a hole's score data
  const handleHoleUpdate = useCallback((data: HoleData) => {
    console.log('Updating hole data:', data);
    
    // Update the hole scores array
    const updatedScores = [...holeScores];
    const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
    
    if (holeIndex >= 0) {
      // Update existing hole
      updatedScores[holeIndex] = data;
    } else {
      // Add new hole
      updatedScores.push(data);
    }
    
    // Set the updated scores array directly
    setHoleScores(updatedScores);
    
    // Save to database if we have a valid round ID
    if (roundId) {
      saveHoleScore(data).catch(error => {
        console.error('Failed to save hole score:', error);
      });
    }
  }, [roundId, saveHoleScore, setHoleScores, holeScores]);

  return {
    currentHole,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData
  };
};
