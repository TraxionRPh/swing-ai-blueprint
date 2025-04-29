
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Auto-resolve loading state after a timeout (shortened)
  useEffect(() => {
    // Clear any existing timeout when loading state changes
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Only set a timeout if explicitly loading
    if (!isLoading) return;
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("Force exiting loading state after timeout");
        setForceLoadingComplete(true);
        setIsLoading(false); // Auto-exit loading state
        
        // Only show toast if we haven't shown one already
        if (!errorShown) {
          setErrorShown(true);
          toast({
            title: "Loading issue detected",
            description: "Some information may be limited. Try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    }, 5000); // Use 5s for better responsiveness
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isLoading, toast, errorShown]);

  // Reset error shown state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setErrorShown(false);
    }
  }, [isLoading]);

  const retryLoading = () => {
    setLoadAttempt(prev => prev + 1);
    // Reset error state on retry
    setErrorShown(false);
  };

  return {
    isLoading,
    setIsLoading,
    loadAttempt,
    setLoadAttempt,
    retryLoading,
    forceLoadingComplete,
    errorShown,
    setErrorShown
  };
};
