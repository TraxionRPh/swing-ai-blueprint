
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
  const scoreDataRef = useRef<HoleData[]>([]);

  // Force timeout to exit loading state after 5 seconds to prevent permanent loading
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const forceExitTimeout = setTimeout(() => {
      setIsInitialLoad(false);
      console.log("Forced exit from loading state after timeout");
    }, 5000); // reduced from 8s to 5s for faster response
    
    return () => clearTimeout(forceExitTimeout);
  }, [isInitialLoad]);

  // Save a local copy of hole scores when they're loaded
  useEffect(() => {
    if (holeScores.length > 0) {
      console.log("Saving hole scores to ref:", holeScores);
      scoreDataRef.current = holeScores;
      setIsInitialLoad(false);
    }
  }, [holeScores]);

  // Check for resume data in sessionStorage and localStorage
  useEffect(() => {
    const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
    const localHoleNumber = localStorage.getItem('resume-hole-number');
    
    if (sessionHoleNumber) {
      console.log("Found resume hole in sessionStorage:", sessionHoleNumber);
    }
    
    if (localHoleNumber) {
      console.log("Found resume hole in localStorage:", localHoleNumber);
    }
  }, []);

  const handleHoleUpdate = useCallback((data: HoleData) => {
    console.log('Updating hole data:', data);
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    
    // Only save to database if roundId exists
    if (roundId) {
      saveHoleScore(data).catch(error => {
        console.error('Failed to save hole score:', error);
      });
    }
  }, [roundId, saveHoleScore, setHoleScores]);

  // Make sure we always have a valid current hole data object
  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || 
    scoreDataRef.current.find(hole => hole.holeNumber === currentHole) || {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };

  console.log("Current score tracking state:", {
    currentHole,
    holeScoresLength: holeScores.length,
    currentHoleData: currentHoleData,
    isSaving: isSaving || isLoading || isInitialLoad
  });

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
