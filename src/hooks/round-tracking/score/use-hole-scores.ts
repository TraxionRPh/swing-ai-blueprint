
import { useEffect, useCallback } from "react";
import { useHoleScoresFetcher } from "./use-hole-scores-fetcher";
import { useHoleScoresState } from "./use-hole-scores-state";
import { useResumeSession } from "./use-resume-session";

export const useHoleScores = (roundId: string | null, courseId?: string) => {
  const {
    holeScores,
    setHoleScores,
    isLoading,
    setIsLoading,
    fetchTimeoutRef,
    maxRetries,
    retryCount,
    initializeDefaultHoleScores,
    cleanupTimeouts
  } = useHoleScoresState();

  const {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    isMountedRef,
    cleanup: cleanupFetcher,
    initialize: initializeFetcher
  } = useHoleScoresFetcher();

  // Check for resume data
  useResumeSession();

  // Initialize data and handle retries when dependencies change
  useEffect(() => {
    // Initialize refs
    initializeFetcher();
    retryCount.current = 0;
    
    const fetchData = async () => {
      if (roundId) {
        try {
          console.log("Attempting to fetch hole scores for round:", roundId);
          const result = await fetchHoleScoresFromRound(roundId);
          
          if (result && isMountedRef.current) {
            setHoleScores(result.formattedScores);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Failed to fetch hole scores in useEffect:', error);
          
          // If we haven't exceeded max retries, try again
          if (retryCount.current < maxRetries.current) {
            retryCount.current++;
            
            // Clear any existing timeout
            cleanupTimeouts();
            
            // Set exponential backoff retry (1s, 2s, 4s)
            const retryDelay = Math.pow(2, retryCount.current - 1) * 1000;
            console.log(`Retrying fetch (${retryCount.current}/${maxRetries.current}) after ${retryDelay}ms`);
            
            fetchTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                fetchData();
              }
            }, retryDelay);
          } else {
            initializeDefaultHoleScores();
          }
        }
      } else if (courseId) {
        try {
          const formattedScores = await fetchHoleScoresFromCourse(courseId);
          if (isMountedRef.current && formattedScores) {
            setHoleScores(formattedScores);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Failed to fetch course holes in useEffect:', error);
          initializeDefaultHoleScores();
        }
      } else {
        // If both roundId and courseId are null, set default scores and stop loading
        initializeDefaultHoleScores();
      }
    };
    
    // Immediate fetch on mount or when dependencies change
    fetchData();
    
    // Cleanup function to clear any timeouts and prevent state updates after unmount
    return () => {
      cleanupFetcher();
      cleanupTimeouts();
    };
  }, [
    roundId, 
    courseId, 
    fetchHoleScoresFromRound, 
    fetchHoleScoresFromCourse, 
    setHoleScores, 
    setIsLoading,
    cleanupTimeouts,
    initializeDefaultHoleScores,
    cleanupFetcher,
    initializeFetcher
  ]);

  // Refetch function for external components to trigger data reload
  const refetchHoleScores = useCallback(async () => {
    if (!roundId) return;
    
    setIsLoading(true);
    try {
      const result = await fetchHoleScoresFromRound(roundId);
      if (result && isMountedRef.current) {
        setHoleScores(result.formattedScores);
      }
    } catch (error) {
      console.error("Failed to refetch hole scores:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [roundId, fetchHoleScoresFromRound, setHoleScores, setIsLoading]);

  return {
    holeScores,
    setHoleScores,
    isLoading,
    fetchHoleScoresFromRound,
    refetchHoleScores
  };
};
