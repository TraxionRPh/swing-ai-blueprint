
import { useEffect, useState, useRef } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  // Simplified state - just track if we're initialized
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttemptedRef = useRef(false);

  // Run once on mount - no dependencies to avoid re-runs
  useEffect(() => {
    // Skip if we've already attempted initialization
    if (initializationAttemptedRef.current) return;
    
    // Mark as initialization attempted immediately to prevent duplicate runs
    initializationAttemptedRef.current = true;
    
    // Mark as initialized immediately
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
  }, [roundId]);  // Only re-run if roundId changes

  return { isInitialized };
};
