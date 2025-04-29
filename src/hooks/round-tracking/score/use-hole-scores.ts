
import { useState, useEffect, useCallback, useRef } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";
import { useHoleDataFetcher } from "./use-hole-data-fetcher";
import { initializeDefaultScores } from "./use-hole-data-formatter";

export const useHoleScores = (roundId: string | null, courseId?: string) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { fetchHoleScoresFromRound, fetchHoleScoresFromCourse } = useHoleDataFetcher();
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = useRef(1); // Reduced to 1 retry for faster performance
  const retryCount = useRef(0);
  const isOffline = useRef(false);

  // Check network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      isOffline.current = !navigator.onLine;
      if (!navigator.onLine && isLoading) {
        // If we go offline during loading, immediately initialize default scores
        initializeDefaultHoleScores();
        setIsLoading(false);
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isLoading]);

  const fetchHoleScoresWrapper = useCallback(async (roundId: string) => {
    if (isOffline.current) {
      console.log("Device appears to be offline, using default hole data");
      initializeDefaultHoleScores();
      return { holeCount: 18 };
    }
    
    setIsLoading(true);
    try {
      const result = await fetchHoleScoresFromRound(roundId);
      if (result?.formattedScores) {
        setHoleScores(result.formattedScores);
      } else {
        initializeDefaultHoleScores();
      }
      return { holeCount: result?.holeCount || 18 };
    } catch (error) {
      console.error('Failed to fetch hole scores in wrapper:', error);
      initializeDefaultHoleScores();
      return { holeCount: 18 };
    } finally {
      setIsLoading(false);
    }
  }, [fetchHoleScoresFromRound]);

  useEffect(() => {
    // Reset retry count when roundId or courseId changes
    retryCount.current = 0;
    
    const fetchData = async () => {
      if (isOffline.current) {
        console.log("Device is offline, skipping data fetch");
        initializeDefaultHoleScores();
        setIsLoading(false);
        return;
      }
      
      if (roundId) {
        try {
          setIsLoading(true);
          await fetchHoleScoresWrapper(roundId);
        } catch (error) {
          console.error('Failed to fetch hole scores in useEffect:', error);
          
          // Retry with shorter delay if needed (reduced timeout)
          if (retryCount.current < maxRetries.current) {
            retryCount.current++;
            
            if (fetchTimeoutRef.current) {
              clearTimeout(fetchTimeoutRef.current);
            }
            
            // Use a fixed 500ms retry delay for faster recovery
            const retryDelay = 500;
            console.log(`Retrying fetch (${retryCount.current}/${maxRetries.current}) after ${retryDelay}ms`);
            
            fetchTimeoutRef.current = setTimeout(() => {
              fetchData();
            }, retryDelay);
          } else {
            initializeDefaultHoleScores();
            setIsLoading(false);
          }
        }
      } else if (courseId) {
        try {
          setIsLoading(true);
          const formattedScores = await fetchHoleScoresFromCourse(courseId);
          setHoleScores(formattedScores);
        } catch (error) {
          console.error('Failed to fetch course holes in useEffect:', error);
          initializeDefaultHoleScores();
        } finally {
          setIsLoading(false);
        }
      } else if (holeScores.length === 0) {
        initializeDefaultHoleScores();
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [roundId, courseId, fetchHoleScoresWrapper, fetchHoleScoresFromCourse, holeScores.length]);

  const initializeDefaultHoleScores = (holeCount: number = 18) => {
    setHoleScores(initializeDefaultScores(holeCount));
  };

  return {
    holeScores,
    setHoleScores,
    isLoading,
    fetchHoleScoresFromRound: fetchHoleScoresWrapper
  };
};
