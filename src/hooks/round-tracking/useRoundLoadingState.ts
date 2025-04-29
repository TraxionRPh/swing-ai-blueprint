
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  // Single loading state with no rapid toggles
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { toast } = useToast();
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  
  // Ensure we clean up any lingering timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  // Ensure we exit loading state after a maximum time
  useEffect(() => {
    if (!isFirstRender.current) return;
    
    isFirstRender.current = false;
    
    // Enforce a maximum time to be in loading state
    loadingTimerRef.current = setTimeout(() => {
      console.log("Safety exit from loading state after timeout");
      setIsLoading(false);
    }, 8000); // 8 seconds is maximum time we'll stay in loading
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  // More stable retry function - no quick toggles
  const retryLoading = () => {
    // Clear any existing timer before setting a new one
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    // Increment attempt counter
    setLoadAttempt(prev => prev + 1);
    
    // Set loading to true without quick toggle behavior
    setIsLoading(true);
    
    // Set a reasonable timeout to exit loading state if needed
    loadingTimerRef.current = setTimeout(() => {
      console.log("Safety exit from loading state after timeout");
      setIsLoading(false);
    }, 8000); // 8 seconds is reasonable for loading to complete
  };

  // Cleanup function to prevent memory leaks
  const cleanupLoading = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  return {
    isLoading,
    setIsLoading,
    loadAttempt,
    setLoadAttempt,
    retryLoading,
    cleanupLoading
  };
};
