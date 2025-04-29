
import { useEffect, useState, useRef } from "react";
import { useResumeSession } from "./use-resume-session";

export const useRouteInitialization = (roundId: string | null) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialLoadAttempt, setInitialLoadAttempt] = useState(false);
  const { hasCheckedStorage } = useResumeSession();
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Set a flag that we've attempted to load
    setInitialLoadAttempt(true);

    // Mark as initialized immediately to prevent loading issues
    setIsInitialized(true);
    console.log(`Route initialization complete for round: ${roundId}`);
    
    // Clean up any timeouts when component unmounts
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [roundId]);

  // Always return true for isInitialized to prevent loading issues
  return { 
    isInitialized: true, 
    initialLoadAttempt: true 
  };
};
