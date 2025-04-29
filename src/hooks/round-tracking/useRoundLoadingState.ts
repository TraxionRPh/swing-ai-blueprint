
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);
  const { toast } = useToast();
  
  // Auto-resolve loading state after a timeout
  useEffect(() => {
    if (!isLoading) return;
    
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Force exiting loading state after timeout");
        setForceLoadingComplete(true);
        
        toast({
          title: "Loading issue detected",
          description: "Some information may be limited. Try refreshing the page.",
          variant: "destructive",
        });
      }
    }, 10000);
    
    return () => clearTimeout(loadingTimeout);
  }, [isLoading, toast]);

  const retryLoading = () => {
    setLoadAttempt(prev => prev + 1);
  };

  return {
    isLoading,
    setIsLoading,
    loadAttempt,
    setLoadAttempt,
    retryLoading,
    forceLoadingComplete
  };
};
