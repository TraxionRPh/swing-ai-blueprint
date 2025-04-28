
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
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchRef = useRef<boolean>(false);
  const maxAttempts = 3;
  
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
      
      try {
        console.log("Fetching hole scores for round ID:", roundId, "attempt:", loadAttempts + 1);
        
        const result = await fetchHoleScoresFromRound(roundId);
        
        if (!isMounted) return;
        
        // Fix: Check if result exists and has holeCount property instead of checking length
        if (result && result.holeCount > 0) {
          setIsInitialLoad(false);
          console.log("Successfully loaded hole scores");
        } else if (loadAttempts >= maxAttempts) {
          // Maximum attempts reached, stop trying
          setIsInitialLoad(false);
          console.log("Reached max attempts without loading hole scores");
        } else if (isMounted) {
          // Try again after a delay with exponential backoff
          console.log("Retrying hole score fetch after delay");
          
          // Clear any existing timeout
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
          }
          
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, loadAttempts) * 1000;
          
          fetchTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              setLoadAttempts(prev => prev + 1);
            }
          }, delay);
        }
      } catch (error) {
        console.error("Error fetching hole scores:", error);
        if (isMounted) {
          if (loadAttempts >= maxAttempts) {
            setIsInitialLoad(false);
          } else {
            // Try again after a delay with exponential backoff
            const delay = Math.pow(2, loadAttempts) * 1000;
            fetchTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                setLoadAttempts(prev => prev + 1);
              }
            }, delay);
          }
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
  }, [roundId, fetchHoleScoresFromRound, loadAttempts, maxAttempts]);

  // Reset load attempts when roundId changes
  useEffect(() => {
    setLoadAttempts(0);
    setIsInitialLoad(true);
    initialFetchRef.current = false;
  }, [roundId]);

  // Force timeout to exit loading state after 10 seconds to prevent permanent loading
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const forceExitTimeout = setTimeout(() => {
      setIsInitialLoad(false);
      console.log("Forced exit from loading state after timeout");
    }, 10000);
    
    return () => clearTimeout(forceExitTimeout);
  }, [isInitialLoad]);

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
