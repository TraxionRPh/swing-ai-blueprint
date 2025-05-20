
import { useState, useMemo, useCallback } from "react";
import type { HoleData } from "@/types/round-tracking";

/**
 * Hook for managing score data and hole updates
 */
export const useScoreData = (
  holeScores: HoleData[],
  setHoleScores: (scores: HoleData[]) => void,
  currentHole: number
) => {
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Create memoized current hole data
  const currentHoleData = useMemo(() => {
    // First try to find the exact hole in the scores array
    const exactHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (exactHole) {
      console.log("Found exact hole data for hole:", currentHole);
      return exactHole;
    }
    
    // If not found, create default data for the current hole
    console.log("Creating default hole data for hole:", currentHole);
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: undefined, // Ensure putts is undefined by default
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [holeScores, currentHole, lastUpdated]);

  // Handle updating a hole's score data and save to database
  const handleHoleUpdate = useCallback(async (data: HoleData) => {
    console.log('Updating hole data in local state:', data);
    
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
    setLastUpdated(Date.now()); // Force re-render with new timestamp
    
    return true;
  }, [setHoleScores, holeScores]);

  return {
    currentHoleData,
    handleHoleUpdate,
  };
};
