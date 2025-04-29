
import { useState, useEffect, useRef } from "react";
import type { HoleData } from "@/types/round-tracking";
import { initializeDefaultScores } from "./use-hole-data-formatter";

export const useHoleScoresState = () => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = useRef(3);
  const retryCount = useRef(0);

  const initializeDefaultHoleScores = (holeCount: number = 18) => {
    const defaultScores = initializeDefaultScores(holeCount);
    console.log("Setting default hole scores:", defaultScores);
    setHoleScores(defaultScores);
    setIsLoading(false);
  };

  const cleanupTimeouts = () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return cleanupTimeouts;
  }, []);

  return {
    holeScores,
    setHoleScores,
    isLoading,
    setIsLoading,
    fetchTimeoutRef,
    maxRetries,
    retryCount,
    initializeDefaultHoleScores,
    cleanupTimeouts
  };
};
