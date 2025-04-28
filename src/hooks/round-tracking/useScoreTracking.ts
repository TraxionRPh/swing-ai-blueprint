
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHoleScores } from "./score/useHoleScores";
import { useHolePersistence } from "./score/useHolePersistence";
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useScoreTracking = (roundId: string | null, courseId?: string) => {
  const { toast } = useToast();
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { holeScores, setHoleScores, isLoading, fetchHoleScoresFromRound } = useHoleScores(roundId, courseId);
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchRef = useRef<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const maxAttempts = 3;
  
  // Clean up any existing timeouts when component unmounts or roundId changes
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [roundId]);
  
  // Log critical info for debugging
  useEffect(() => {
    console.log(`useScoreTracking: round ${roundId}, loading: ${isLoading}, initial: ${isInitialLoad}, attempts: ${loadAttempts}`);
  }, [roundId, isLoading, isInitialLoad, loadAttempts]);

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
        
        // Check if result exists and has holeCount property
        if (result && typeof result.holeCount === 'number') {
          setIsInitialLoad(false);
          setLoadError(null);
          console.log("Successfully loaded hole scores");
        } else if (loadAttempts >= maxAttempts) {
          // Maximum attempts reached, stop trying
          setIsInitialLoad(false);
          console.log("Reached max attempts without loading hole scores");
          setLoadError(new Error("Failed to load hole scores after multiple attempts"));
        } else if (isMounted) {
          // Try again after a delay with exponential backoff
          console.log("Retrying hole score fetch after delay");
          
          // Clear any existing timeout
          if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
          }
          
          // Faster exponential backoff: 0.75s, 1.1s, 1.7s
          const delay = Math.min(750 * Math.pow(1.5, loadAttempts), 3000);
          
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
            setLoadError(error instanceof Error ? error : new Error("Unknown error loading hole scores"));
          } else {
            // Try again after a delay with exponential backoff
            const delay = Math.min(750 * Math.pow(1.5, loadAttempts), 3000);
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
    setLoadError(null);
    initialFetchRef.current = false;
  }, [roundId]);

  // Force timeout to exit loading state after 8 seconds to prevent permanent loading
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const forceExitTimeout = setTimeout(() => {
      setIsInitialLoad(false);
      console.log("Forced exit from loading state after timeout");
      if (!loadError) {
        setLoadError(new Error("Loading timed out"));
      }
      toast({
        title: "Loading took too long",
        description: "Please try again or refresh the page",
        variant: "destructive"
      });
    }, 7000); // reduced from 8s to 7s
    
    return () => clearTimeout(forceExitTimeout);
  }, [isInitialLoad, loadError, toast]);

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
    currentHoleData,
    loadError,
    retryLoading: () => setLoadAttempts(prev => prev + 1)
  };
};
