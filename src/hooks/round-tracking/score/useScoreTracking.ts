import { useState, useCallback, useMemo, useEffect } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./useHoleNavigation";
import { useHolePersistence } from "./useHolePersistence";

export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  // Simple initialization effect
  useEffect(() => {
    console.log("useScoreTracking initialized with:", { roundId, currentHole });
    
    // Simple timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [roundId, currentHole]);
  
  // Apply resume hole from session storage if available
  useEffect(() => {
    const resumeHole = sessionStorage.getItem('resume-hole-number');
    if (resumeHole && roundId) {
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
    if (roundId && data.holeNumber && (data.score > 0 || data.putts > 0)) {
      console.log("Saving hole data to database:", data);
      try {
        await saveHoleScore(data);
      } catch (err) {
        console.error("Error saving hole data:", err);
      }
    }
  }, [roundId, saveHoleScore, setHoleScores, holeScores]);
  
  // Save current hole data and navigate to next hole
  const saveAndNavigateNext = useCallback(async () => {
    const currentData = currentHoleData;
    
    if (roundId && currentData) {
      console.log("Saving hole data before navigating to next hole", currentData);
      try {
        await saveHoleScore(currentData);
        console.log("Successfully saved hole data before navigation");
        handleNext();
      } catch (err) {
        console.error("Failed to save hole data:", err);
        // Still navigate even if save fails
        handleNext();
      }
    } else {
      handleNext();
    }
  }, [currentHoleData, roundId, saveHoleScore, handleNext]);
  
  // Save current hole data and navigate to previous hole
  const saveAndNavigatePrevious = useCallback(async () => {
    const currentData = currentHoleData;
    
    if (roundId && currentData) {
      console.log("Saving hole data before navigating to previous hole", currentData);
      try {
        await saveHoleScore(currentData);
        console.log("Successfully saved hole data before navigation");
        handlePrevious();
      } catch (err) {
        console.error("Failed to save hole data:", err);
        // Still navigate even if save fails
        handlePrevious();
      }
    } else {
      handlePrevious();
    }
  }, [currentHoleData, roundId, saveHoleScore, handlePrevious]);

  // Clear any resume data
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
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
    clearResumeData
  };
};
