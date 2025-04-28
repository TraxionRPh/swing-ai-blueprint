
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect } from "react";

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
  
  // Show retry option sooner - after 4 seconds instead of 6
  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    if (retryFn) {
      // Use provided retry function if available
      retryFn();
      // Reset the retry state
      setShowRetry(false);
      // Set timeout again
      const timer = setTimeout(() => setShowRetry(true), 4000);
      return () => clearTimeout(timer);
    } else {
      // Fallback to page reload
      window.location.reload();
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
            Taking longer than expected. There might be a connection issue.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading round
          </Button>
        </div>
      )}
      
      {children}
    </div>
  );
};
