
import { useState, useCallback, useRef, useEffect } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./useHoleNavigation";
import { useHoleScores } from "./use-hole-scores";
import { useHolePersistence } from "./use-hole-persistence";

export const useScoreTracking = (roundId: string | null, courseId?: string) => {
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { holeScores, setHoleScores, isLoading } = useHoleScores(roundId, courseId);
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Force timeout to exit loading state after 5 seconds to prevent permanent loading
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const forceExitTimeout = setTimeout(() => {
      setIsInitialLoad(false);
      console.log("Forced exit from loading state after timeout");
    }, 5000); // reduced from 8s to 5s for faster response
    
    return () => clearTimeout(forceExitTimeout);
  }, [isInitialLoad]);

  // Check localStorage as a backup for resuming hole number
  useEffect(() => {
    const localStorageHoleNumber = localStorage.getItem('resume-hole-number');
    if (localStorageHoleNumber && !isNaN(Number(localStorageHoleNumber))) {
      console.log("Found backup hole number in localStorage:", localStorageHoleNumber);
      localStorage.removeItem('resume-hole-number');
    }
  }, []);

  const handleHoleUpdate = useCallback((data: HoleData) => {
    console.log('Updating hole data:', data);
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    
    if (roundId) {
      saveHoleScore(data).catch(error => {
        console.error('Failed to save hole score:', error);
      });
    }
  }, [roundId, saveHoleScore, setHoleScores]);

  // Make sure we always have a valid current hole data object
  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  };

  return {
    currentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving: isSaving || isLoading || isInitialLoad,
    currentHoleData
  };
};
