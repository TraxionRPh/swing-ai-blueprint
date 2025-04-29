
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  // Single loading state that persists until explicitly turned off
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { toast } = useToast();
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const hasInitializedRef = useRef(false);
  
  // Ensure we clean up any lingering timers on mount/unmount
  useEffect(() => {
    console.log("useRoundLoadingState initialized");
    mountedRef.current = true;
    
    // Enforce a maximum time to be in loading state (safety net only)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadingTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.log("Safety exit from loading state after timeout");
          setIsLoading(false);
        }
      }, 5000); // 5 seconds maximum loading time
    }
    
    return () => {
      mountedRef.current = false;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []); // Empty array - this runs exactly once per mount
  
  // Stable retry function with debounce
  const retryLoading = () => {
    // Prevent retry spam
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Set loading to true and increment attempt counter atomically
    if (mountedRef.current) {
      console.log("Retrying loading");
      setIsLoading(true);
      setLoadAttempt(prev => prev + 1);
    }
    
    // Set a safety timeout
    loadingTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.log("Safety exit from loading state after retry timeout");
        setIsLoading(false);
      }
    }, 5000);
  };

  // Explicit set loading function
  const setLoadingState = (state: boolean) => {
    if (!mountedRef.current) return;
    
    // Cancel any pending timeout
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Only update if mounted and state is different (prevent unnecessary renders)
    if (mountedRef.current && isLoading !== state) {
      console.log(`Explicitly setting loading state: ${state}`);
      setIsLoading(state);
    }
    
    // If turning on loading, set a safety timeout
    if (state && mountedRef.current) {
      loadingTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.log("Safety exit from loading state after explicit set timeout");
          setIsLoading(false);
        }
      }, 5000);
    }
  };

  // Cleanup function for unmount
  const cleanupLoading = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  return {
    isLoading,
    setIsLoading: setLoadingState, // Replace with our controlled function
    loadAttempt,
    setLoadAttempt,
    retryLoading,
    cleanupLoading
  };
};
