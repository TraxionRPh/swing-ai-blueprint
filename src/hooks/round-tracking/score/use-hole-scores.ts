
import { useEffect, useCallback, useRef } from "react";
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
  const { savedHoleNumber, clearResumeData } = useResumeSession();

  // Track if we've initialized
  const hasInitializedRef = useRef(false);

  // Initialize data and handle retries when dependencies change
  useEffect(() => {
    // Skip if we've already initialized
    if (hasInitializedRef.current) {
      console.log("useHoleScores: Already initialized, skipping");
      return;
    }
    
    // Mark as initialized immediately to prevent multiple initializations
    hasInitializedRef.current = true;
    console.log("useHoleScores: Initializing for the first time");

    // Initialize refs
    initializeFetcher();
    retryCount.current = 0;
    
    const fetchData = async () => {
      if (!isMountedRef.current) return;
      
      if (roundId) {
        try {
          console.log("Attempting to fetch hole scores for round:", roundId);
          setIsLoading(true); // Ensure loading state is true during fetch
          
          const result = await fetchHoleScoresFromRound(roundId);
          
          if (result && isMountedRef.current) {
            console.log("Successfully loaded hole scores data:", result.formattedScores.length);
            setHoleScores(result.formattedScores);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Failed to fetch hole scores in useEffect:', error);
          initializeDefaultHoleScores();
        }
      } else if (courseId) {
        try {
          setIsLoading(true); // Ensure loading state is true during fetch
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
        console.log("No roundId or courseId provided, using default scores");
        initializeDefaultHoleScores();
      }
    };
    
    // Immediate fetch on mount without setTimeout
    fetchData();
    
    // Cleanup function to clear any timeouts and prevent state updates after unmount
    return () => {
      console.log("useHoleScores: Cleaning up");
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
    if (!roundId || !isMountedRef.current) return;
    
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
    refetchHoleScores,
    savedHoleNumber
  };
};
