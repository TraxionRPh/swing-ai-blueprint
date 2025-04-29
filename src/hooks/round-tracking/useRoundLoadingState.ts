
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const { toast } = useToast();
  
  // Auto-resolve loading state after a timeout
  useEffect(() => {
    if (!isLoading) return;
    
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Force exiting loading state after timeout");
        setForceLoadingComplete(true);
        
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
    }, 10000); // Using 10s for very slow connections
    
    return () => clearTimeout(loadingTimeout);
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
