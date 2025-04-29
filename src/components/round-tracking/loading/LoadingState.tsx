
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ReactNode, useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  
  // Show retry option sooner - after 2 seconds instead of 3
  useEffect(() => {
    const timer = setTimeout(() => setShowRetry(true), 2000);
    const networkTimer = setTimeout(() => setShowNetworkAlert(true), 4000); // reduced from 5s to 4s
    return () => {
      clearTimeout(timer); 
      clearTimeout(networkTimer);
    };
  }, []);

  const handleRefresh = () => {
    setShowNetworkAlert(false); // Hide alert when retrying
    
    if (retryFn) {
      // Use provided retry function if available
      retryFn();
      // Reset the retry state
      setShowRetry(false);
      // Set timeout again
      const timer = setTimeout(() => setShowRetry(true), 2000);
      const networkTimer = setTimeout(() => setShowNetworkAlert(true), 4000);
      return () => {
        clearTimeout(timer);
        clearTimeout(networkTimer);
      };
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  // If we have a roundId, show a shortened version
  const displayMessage = roundId 
    ? `${message} (Round: ${roundId.substring(0, 6)}...)`
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
      
      {showNetworkAlert && (
        <Alert className="mt-4 mx-auto max-w-md">
          <AlertDescription className="text-center">
            There might be a connection issue. Check your network connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {showRetry && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Taking longer than expected. 
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
