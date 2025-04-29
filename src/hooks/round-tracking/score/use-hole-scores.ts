
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
  const maxRetries = useRef(2); // Reduced from 3 to 2
  const retryCount = useRef(0);

  const fetchHoleScoresWrapper = useCallback(async (roundId: string) => {
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
      if (roundId) {
        try {
          await fetchHoleScoresWrapper(roundId);
        } catch (error) {
          console.error('Failed to fetch hole scores in useEffect:', error);
          
          // Retry with shorter delay if needed (reduced timeout)
          if (retryCount.current < maxRetries.current) {
            retryCount.current++;
            
            if (fetchTimeoutRef.current) {
              clearTimeout(fetchTimeoutRef.current);
            }
            
            // Reduced exponential backoff (500ms, 1s)
            const retryDelay = Math.pow(2, retryCount.current - 1) * 500;
            console.log(`Retrying fetch (${retryCount.current}/${maxRetries.current}) after ${retryDelay}ms`);
            
            fetchTimeoutRef.current = setTimeout(() => {
              fetchData();
            }, retryDelay);
          } else {
            initializeDefaultHoleScores();
          }
        }
      } else if (courseId) {
        try {
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
