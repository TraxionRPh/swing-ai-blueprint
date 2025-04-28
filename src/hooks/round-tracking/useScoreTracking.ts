
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHoleScores } from "./score/useHoleScores";
import { useHolePersistence } from "./score/useHolePersistence";
import { useEffect, useState, useCallback, useRef } from "react";

export const useScoreTracking = (roundId: string | null, courseId?: string) => {
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { holeScores, setHoleScores, isLoading, fetchHoleScoresFromRound } = useHoleScores(roundId, courseId);
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const fetchTimeoutRef = useRef<number | null>(null);
  
  // Clean up any existing timeouts when component unmounts or roundId changes
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [roundId]);
  
  // Add useEffect to refetch hole scores when roundId changes
  useEffect(() => {
    let isMounted = true;
    
    const loadHoleScores = async () => {
      if (!roundId) {
        if (isMounted) {
          setIsInitialLoad(false);
        }
        return;
      }
      
      try {
        console.log("Fetching hole scores for round ID:", roundId, "attempt:", loadAttempts + 1);
        
        const result = await fetchHoleScoresFromRound(roundId);
        
        if (!isMounted) return;
        
        // If we got a successful result or we've reached max attempts, stop loading
        if (result || loadAttempts >= 2) {
          setIsInitialLoad(false);
        } else {
          // If we haven't reached max attempts, try again after a delay
          if (loadAttempts < 2) {
            // Store the timeout ID so we can clear it if component unmounts
            if (fetchTimeoutRef.current) {
              clearTimeout(fetchTimeoutRef.current);
            }
            
            fetchTimeoutRef.current = window.setTimeout(() => {
              if (isMounted) {
                setLoadAttempts(prev => prev + 1);
              }
            }, 1500);
          } else {
            setIsInitialLoad(false);
          }
        }
      } catch (error) {
        console.error("Error fetching hole scores:", error);
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }
    };
    
    loadHoleScores();
    
    return () => {
      isMounted = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [roundId, fetchHoleScoresFromRound, loadAttempts]);

  // Reset load attempts when roundId changes
  useEffect(() => {
    setLoadAttempts(0);
    setIsInitialLoad(true);
  }, [roundId]);

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

  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  };

  console.log('Current hole data:', currentHoleData);

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
