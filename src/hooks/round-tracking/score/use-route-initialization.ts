
import { useEffect, useState } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(true); // Always start as initialized
  const [initialLoadAttempt, setInitialLoadAttempt] = useState(true); // Always start as attempted

  // Simple effect for logging only - no state management
  useEffect(() => {
    console.log(`Route initialization started for round: ${roundId}`);
    return () => {
      console.log(`Route cleanup for round: ${roundId}`);
    };
  }, [roundId]);

  // Always return true for isInitialized to prevent loading issues
  return { 
    isInitialized: true, 
    initialLoadAttempt: true 
  };
};
