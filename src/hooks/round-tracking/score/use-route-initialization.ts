
import { useEffect, useState } from "react";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialLoadAttempt, setInitialLoadAttempt] = useState(false);

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Set a flag that we've attempted to load
    setInitialLoadAttempt(true);

    // Mark as initialized after a short delay to ensure other hooks have time to run
    const timer = setTimeout(() => {
      setIsInitialized(true);
      console.log(`Route initialization complete for round: ${roundId}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [roundId]);

  // Force initialization after a timeout as a fallback
  useEffect(() => {
    if (isInitialized) return;

    const forceTimer = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
        console.log("Force initializing route after timeout");
      }
    }, 2000);

    return () => clearTimeout(forceTimer);
  }, [isInitialized]);

  return { isInitialized, initialLoadAttempt };
};
