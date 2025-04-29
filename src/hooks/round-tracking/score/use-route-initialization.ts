
import { useEffect, useState, useRef } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttemptedRef = useRef(false);
  const roundIdRef = useRef<string | null>(null);

  // Compare roundId to see if it's really changed
  const hasRoundIdChanged = roundId !== roundIdRef.current;

  // Run once on mount or when roundId changes significantly
  useEffect(() => {
    // Store current roundId for comparison
    roundIdRef.current = roundId;
    
    // Skip if already initialized and roundId hasn't changed
    if (initializationAttemptedRef.current && !hasRoundIdChanged) {
      return;
    }
    
    // Mark as initialization attempted immediately to prevent duplicate runs
    initializationAttemptedRef.current = true;
    
    // Mark as initialized after a short delay to prevent flickering
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
  }, [roundId, hasRoundIdChanged]); // Only re-run if roundId changes

  return { isInitialized };
};
