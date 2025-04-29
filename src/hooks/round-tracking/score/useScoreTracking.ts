
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
  const scoreDataRef = useRef<HoleData[]>([]);

  // Force timeout to exit loading state after 5 seconds (reduced from 8s to 5s)
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const forceExitTimeout = setTimeout(() => {
      setIsInitialLoad(false);
    }, 5000);
    
    return () => clearTimeout(forceExitTimeout);
  }, [isInitialLoad]);

  // Save a local copy of hole scores when they're loaded
  useEffect(() => {
    if (holeScores.length > 0) {
      scoreDataRef.current = holeScores;
      setIsInitialLoad(false);
    }
  }, [holeScores]);

  const handleHoleUpdate = useCallback((data: HoleData) => {
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
