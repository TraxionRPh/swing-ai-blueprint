
import { useEffect, useState, useRef } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  // Single source of truth for initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if we've attempted initialization and the current roundId
  const initializationAttemptedRef = useRef(false);
  const roundIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Run once on mount or when roundId changes significantly
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Store current roundId for comparison
    const hasRoundIdChanged = roundId !== roundIdRef.current;
    roundIdRef.current = roundId;
    
    console.log(`Route initialization check - roundId: ${roundId}, already attempted: ${initializationAttemptedRef.current}, changed: ${hasRoundIdChanged}`);
    
    // Skip if already initialized and roundId hasn't changed
    if (initializationAttemptedRef.current && !hasRoundIdChanged) {
      console.log("Skipping duplicate initialization");
      return;
    }
    
    // Mark as initialization attempted immediately to prevent duplicate runs
    initializationAttemptedRef.current = true;
    
    // Mark as initialized immediately to prevent flickering
    if (isMountedRef.current) {
      setIsInitialized(true);
      console.log(`Route initialization complete for round: ${roundId}`);
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [roundId]); // Only re-run if roundId changes

  return { isInitialized };
};
