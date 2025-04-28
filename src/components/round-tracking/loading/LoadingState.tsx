
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw, Loader2 } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect, useRef } from "react";

interface LoadingStateProps {
  onBack: () => void;
  children?: ReactNode;
  hideHeader?: boolean;
  message?: string;
  retryFn?: () => void;
  roundId?: string;
}

export const LoadingState = ({ 
  onBack, 
  children, 
  hideHeader = false, 
  message = "Loading round data...",
  retryFn,
  roundId
}: LoadingStateProps) => {
  const [showRetry, setShowRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = 2;
  
  // Clear any existing timers on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);
  
  // Show retry option sooner - after 3.5 seconds instead of 4
  useEffect(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
    }
    
    retryTimerRef.current = setTimeout(() => {
      setShowRetry(true);
    }, 3500);
    
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [retryCount]);

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    setShowRetry(false);
    
    if (retryFn) {
      // Use provided retry function if available
      retryFn();
    } else if (retryCount >= maxRetries) {
      // If we've retried too many times, reload the page
      window.location.reload();
    } else {
      // Just reset the timer and state as a fallback
      console.log("Retrying load attempt:", retryCount + 1);
    }
  };

  // If we have a roundId, append it to the message
  const displayMessage = roundId 
    ? `${message} (Round ID: ${roundId.substring(0, 8)}...)`
    : message;
  
  return (
    <div className="space-y-6 w-full">
      {!hideHeader && (
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack}
            className="text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        </div>
      )}
      
      <div className="w-full flex justify-center">
        <Loading message={displayMessage} />
      </div>
      
      {showRetry && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {retryCount > 0 
              ? "Still having trouble loading your round. Let's try again."
              : "Taking longer than expected. There might be a connection issue."}
          </p>
          <Button onClick={handleRefresh} disabled={retryCount >= maxRetries && !retryFn}>
            {retryCount >= maxRetries && !retryFn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reloading page...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry loading round
              </>
            )}
          </Button>
        </div>
      )}
      
      {children}
    </div>
  );
};
