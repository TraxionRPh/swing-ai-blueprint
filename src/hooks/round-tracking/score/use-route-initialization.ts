
import { useEffect, useState, useRef } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttemptedRef = useRef(false);

  // Run once on mount - limited dependencies to prevent endless re-runs
  useEffect(() => {
    // Do not run initialization more than once
    if (initializationAttemptedRef.current) {
      return;
    }
    
    // Mark as initialization attempted immediately to prevent duplicate runs
    initializationAttemptedRef.current = true;
    
    // Mark as initialized
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
  }, []); // Empty dependency array to ensure it only runs once on mount

  return { isInitialized };
};
