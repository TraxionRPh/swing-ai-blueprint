
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { toast } = useToast();
  
  const retryLoading = () => {
    setLoadAttempt(prev => prev + 1);
    // Briefly set loading to true to trigger a refresh
    setIsLoading(true);
    // Then immediately schedule it to be turned off
    setTimeout(() => setIsLoading(false), 100);
  };

  return {
    isLoading,
    setIsLoading,
    loadAttempt,
    setLoadAttempt,
    retryLoading
  };
};
