
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
  const initialFetchRef = useRef<boolean>(false);
  
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
      // Clear the loading state if no roundId is provided
      if (!roundId) {
        if (isMounted) {
          setIsInitialLoad(false);
        }
        return;
      }
      
      // Prevent duplicate loading if we've already started fetching
      if (initialFetchRef.current) {
        return;
      }
      
      initialFetchRef.current = true;
      
      try {
        console.log("Fetching hole scores for round ID:", roundId, "attempt:", loadAttempts + 1);
        
        const result = await fetchHoleScoresFromRound(roundId);
        
        if (!isMounted) return;
        
        // If we got a successful result or we've reached max attempts, stop loading
        if (result || loadAttempts >= 2) {
          setIsInitialLoad(false);
          console.log("Successfully loaded hole scores or reached max attempts");
        } else if (loadAttempts < 2) {
          // If we haven't reached max attempts, try again after a delay
          console.log("Retrying hole score fetch after delay");
          
          // Clear any existing timeout
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
          }
          
          // Set a new timeout for retry
          fetchTimeoutRef.current = window.setTimeout(() => {
            if (isMounted) {
              setLoadAttempts(prev => prev + 1);
              // Reset the initialFetchRef so we can try again
              initialFetchRef.current = false;
            }
          }, 1500);
        } else {
          // We've reached max attempts
          setIsInitialLoad(false);
          console.log("Max load attempts reached, stopping retries");
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
      initialFetchRef.current = false;
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
    initialFetchRef.current = false;
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
