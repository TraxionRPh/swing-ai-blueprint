
import { useEffect, useState } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  // Simplified state - just track if we're initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Run once on mount - no dependencies to avoid re-runs
  useEffect(() => {
    // Mark as initialized immediately
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
    
    // No cleanup needed for this simple effect
  }, []);  // Empty dependency array ensures this runs only once

  return { isInitialized };
};
