
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export type LoadingStage = 'idle' | 'initializing' | 'fetching' | 'preparing' | 'ready' | 'failed';

interface RoundLoadingState {
  isLoading: boolean;
  loadingStage: LoadingStage;
  retryCount: number;
  error: string | null;
  forceComplete: boolean;
}

export const useRoundLoadingState = (roundId: string | null) => {
  const [loadingState, setLoadingState] = useState<RoundLoadingState>({
    isLoading: !!roundId,
    loadingStage: roundId ? 'initializing' : 'idle',
    retryCount: 0,
    error: null,
    forceComplete: false
  });
  const { toast } = useToast();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 2;

  // Auto-timeout safety to prevent infinite loading
  useEffect(() => {
    if (!loadingState.isLoading || loadingState.loadingStage === 'ready') {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      return;
    }
    
    // Set a reasonable timeout (4 seconds) to force exit from loading
    loadingTimeoutRef.current = setTimeout(() => {
      console.log("Round loading timeout triggered - forcing exit from loading state");
      
      if (loadingState.retryCount < maxRetries) {
        // Attempt retry
        setLoadingState(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          loadingStage: 'initializing' // Reset to initial loading stage
        }));
        
        toast({
          title: "Loading taking longer than expected",
          description: `Retrying... (Attempt ${loadingState.retryCount + 1}/${maxRetries})`,
          variant: "default"
        });
      } else {
        // Max retries reached, force complete loading
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          forceComplete: true,
          loadingStage: 'ready',
          error: "Loading timed out after multiple attempts"
        }));
        
        toast({
          title: "Loading issue detected",
          description: "Showing available data. Some information may be limited.",
          variant: "destructive"
        });
      }
    }, 4000); // Reduced from previous implementations that used 8-10 seconds
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [loadingState.isLoading, loadingState.loadingStage, loadingState.retryCount, toast]);

  // Start loading process when roundId changes
  useEffect(() => {
    if (roundId) {
      setLoadingState({
        isLoading: true,
        loadingStage: 'initializing',
        retryCount: 0,
        error: null,
        forceComplete: false
      });
    } else {
      setLoadingState({
        isLoading: false,
        loadingStage: 'idle',
        retryCount: 0,
        error: null,
        forceComplete: false
      });
    }
  }, [roundId]);

  const setLoadingStage = (stage: LoadingStage) => {
    console.log(`Setting loading stage: ${stage}`);
    setLoadingState(prev => ({
      ...prev,
      loadingStage: stage,
      isLoading: stage !== 'ready' && stage !== 'failed'
    }));
  };

  const setError = (error: string) => {
    console.error(`Round loading error: ${error}`);
    setLoadingState(prev => ({
      ...prev,
      error,
      loadingStage: 'failed'
    }));
  };

  const resetLoading = () => {
    setLoadingState({
      isLoading: true,
      loadingStage: 'initializing',
      retryCount: 0,
      error: null,
      forceComplete: false
    });
  };

  return {
    ...loadingState,
    setLoadingStage,
    setError,
    resetLoading
  };
};
