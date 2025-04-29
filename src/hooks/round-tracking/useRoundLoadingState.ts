
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useRoundLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [errorShown, setErrorShown] = useState(false);
  const { toast } = useToast();
  
  const retryLoading = () => {
    setLoadAttempt(prev => prev + 1);
    setErrorShown(false);
  };

  return {
    isLoading,
    setIsLoading,
    loadAttempt,
    setLoadAttempt,
    retryLoading,
    errorShown,
    setErrorShown
  };
};
