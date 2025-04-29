
import { useEffect, useCallback, useRef, useState } from "react";
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

  // Track if we've initialized and the last roundId/courseId we processed
  const hasInitializedRef = useRef(false);
  const lastRoundIdRef = useRef<string | null>(null);
  const lastCourseIdRef = useRef<string | undefined>(undefined);
  const [initializing, setInitializing] = useState(false);

  // Reset initialization when key dependencies change
  const shouldReinitialize = roundId !== lastRoundIdRef.current || 
                             courseId !== lastCourseIdRef.current;

  // Initialize data once when dependencies are available
  useEffect(() => {
    // Update refs to track current values
    lastRoundIdRef.current = roundId;
    lastCourseIdRef.current = courseId;

    // Skip if we're currently initializing
    if (initializing) {
      console.log("useHoleScores: Already initializing, skipping");
      return;
    }
    
    // Skip if we've already initialized and dependencies haven't changed
    if (hasInitializedRef.current && !shouldReinitialize) {
      console.log("useHoleScores: Already initialized with same IDs, skipping");
      return;
    }
    
    // Set initializing flag to prevent duplicate processing
    setInitializing(true);
    console.log("useHoleScores: Starting initialization with roundId:", roundId, "courseId:", courseId);
    
    // Initialize refs and reset retry count
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
            setInitializing(false);
            hasInitializedRef.current = true;
          }
        } catch (error) {
          console.error('Failed to fetch hole scores:', error);
          // Initialize default scores if we can't get data
          initializeDefaultHoleScores(18);
          setInitializing(false);
          hasInitializedRef.current = true;
        }
      } else if (courseId) {
        try {
          setIsLoading(true); // Ensure loading state is true during fetch
          
          const formattedScores = await fetchHoleScoresFromCourse(courseId);
          
          if (isMountedRef.current && formattedScores) {
            setHoleScores(formattedScores);
            setIsLoading(false);
            setInitializing(false);
            hasInitializedRef.current = true;
          }
        } catch (error) {
          console.error('Failed to fetch course holes:', error);
          initializeDefaultHoleScores(18);
          setInitializing(false);
          hasInitializedRef.current = true;
        }
      } else {
        // If both roundId and courseId are null, set default scores and stop loading
        console.log("No roundId or courseId provided, using default scores");
        initializeDefaultHoleScores(18);
        setInitializing(false);
        hasInitializedRef.current = true;
        setIsLoading(false);
      }
    };
    
    // Immediate fetch on mount
    fetchData();
    
    // Cleanup function to clear any timeouts and prevent state updates after unmount
    return () => {
      console.log("useHoleScores: Cleaning up");
      cleanupFetcher();
      cleanupTimeouts();
      setInitializing(false);
    };
  }, [
    roundId, 
    courseId,
    shouldReinitialize // Add this to ensure we re-run when key deps change
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
