
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  // Single loading state - no quick toggles
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { toast } = useToast();
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // More stable retry function - no quick toggles
  const retryLoading = () => {
    // Clear any existing timer before setting a new one
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    // Increment attempt counter
    setLoadAttempt(prev => prev + 1);
    
    // Set loading to true without the quick toggle behavior
    setIsLoading(true);
    
    // Set a reasonable timeout to exit loading state if needed
    loadingTimerRef.current = setTimeout(() => {
      console.log("Safety exit from loading state after timeout");
      setIsLoading(false);
    }, 5000); // 5 seconds is reasonable for loading to complete
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
