
import { useState, useCallback, useMemo, useEffect } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "../score/useHoleNavigation";
import { useHolePersistence } from "../score/use-hole-persistence";
import { useRoundFinalization } from "../useRoundFinalization";

export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  // Import the finishRound functionality
  const baseFinishRound = useCallback(async (holeScores: HoleData[], holeCount: number) => {
    console.log("Base finish round called with:", { holeScores, holeCount, roundId });
    
    if (!roundId || roundId === "new") {
      console.warn("Cannot finish round: Invalid round ID");
      return false;
    }
    
    try {
      // This is a simplified implementation - the actual logic would be handled in the parent component
      console.log("Would finish round with ID:", roundId);
      return true;
    } catch (error) {
      console.error("Error in baseFinishRound:", error);
      return false;
    }
  }, [roundId]);
  
  const { finishRound } = useRoundFinalization(baseFinishRound, holeScores);
  
  // Initialize new rounds at hole 1
  useEffect(() => {
    // Check if this is a new round and force starting at hole 1
    if (roundId === 'new' || sessionStorage.getItem('force-new-round') === 'true') {
      console.log("New round detected in useScoreTracking, resetting to hole 1");
      setCurrentHole(1);
      
      // Clear the force-new-round flag after it's been processed
      if (sessionStorage.getItem('force-new-round') === 'true') {
        sessionStorage.removeItem('force-new-round');
      }
      return;
    }
    
    // For existing rounds, check if there's resume data
    const resumeHole = sessionStorage.getItem('resume-hole-number');
    if (resumeHole && roundId && roundId !== 'new') {
      const holeNum = Number(resumeHole);
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= 18) {
        console.log(`Setting current hole to resumed hole: ${holeNum}`);
        setCurrentHole(holeNum);
      }
    }
  }, [roundId, setCurrentHole]);
  
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
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [holeScores, currentHole, lastUpdated]);

  // Handle updating a hole's score data and save to database
  const handleHoleUpdate = useCallback(async (data: HoleData) => {
    console.log('Updating hole data and saving to database:', data);
    
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
    
    // If we have a roundId and valid score data, save immediately to the database
    if (roundId && roundId !== "new" && data.holeNumber && (data.score > 0 || data.putts > 0)) {
      console.log("Saving hole data to database:", data);
      try {
        await saveHoleScore(data);
      } catch (err) {
        console.error("Error saving hole data:", err);
      }
    }
  }, [roundId, saveHoleScore, setHoleScores, holeScores]);
  
  // Save current hole data and navigate to next hole
  const saveAndNavigateNext = useCallback(() => {
    const currentData = currentHoleData;
    
    if (roundId && roundId !== "new" && currentData) {
      console.log("Saving hole data before navigating to next hole", currentData);
      saveHoleScore(currentData).catch((err) => {
        console.error("Failed to save hole data:", err);
      });
    }
    handleNext();
  }, [currentHoleData, roundId, saveHoleScore, handleNext]);
  
  // Save current hole data and navigate to previous hole
  const saveAndNavigatePrevious = useCallback(() => {
    const currentData = currentHoleData;
    
    if (roundId && roundId !== "new" && currentData) {
      console.log("Saving hole data before navigating to previous hole", currentData);
      saveHoleScore(currentData).catch((err) => {
        console.error("Failed to save hole data:", err);
      });
    }
    handlePrevious();
  }, [currentHoleData, roundId, saveHoleScore, handlePrevious]);

  // Clear any resume data
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    sessionStorage.removeItem('force-new-round');
    console.log("Resume data cleared");
  }, []);

  return {
    currentHole,
    setCurrentHole,
    handleHoleUpdate,
    handleNext: saveAndNavigateNext,
    handlePrevious: saveAndNavigatePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
    finishRound // Export the finishRound function
  };
};
