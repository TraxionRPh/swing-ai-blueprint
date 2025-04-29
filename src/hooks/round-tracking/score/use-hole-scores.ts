
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

  const fetchHoleScoresWrapper = useCallback(async (roundId: string) => {
    setIsLoading(true);
    try {
      const result = await fetchHoleScoresFromRound(roundId);
      setHoleScores(result.formattedScores);
      return { holeCount: result.holeCount };
    } catch (error) {
      console.error('Failed to fetch hole scores in wrapper:', error);
      initializeDefaultHoleScores();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchHoleScoresFromRound]);

  useEffect(() => {
    if (roundId) {
      fetchHoleScoresWrapper(roundId).catch(error => {
        console.error('Failed to fetch hole scores in useEffect:', error);
        initializeDefaultHoleScores();
      });
    } else if (courseId) {
      fetchHoleScoresFromCourse(courseId)
        .then(formattedScores => setHoleScores(formattedScores))
        .catch(error => {
          console.error('Failed to fetch course holes in useEffect:', error);
          initializeDefaultHoleScores();
        })
        .finally(() => setIsLoading(false));
    } else if (holeScores.length === 0) {
      initializeDefaultHoleScores();
    }
    
    // Cleanup function to clear any timeouts
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [roundId, courseId, fetchHoleScoresWrapper, fetchHoleScoresFromCourse]);

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
