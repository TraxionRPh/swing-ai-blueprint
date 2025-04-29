
import { useEffect, useState } from "react";
import { useResumeSession } from "./use-resume-session";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialLoadAttempt, setInitialLoadAttempt] = useState(false);
  const { hasCheckedStorage } = useResumeSession();

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Set a flag that we've attempted to load
    setInitialLoadAttempt(true);

    // Mark as initialized immediately to prevent loading issues
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
    
    // No need to wait for storage checks anymore
  }, [roundId]);

  return { isInitialized: true, initialLoadAttempt };
};
